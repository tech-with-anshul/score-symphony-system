
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define interface for the profile data structure
interface ProfileData {
  id: string;
  username: string;
  role: 'admin' | 'judge';
  name?: string | null;
  email?: string | null;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'admin' | 'judge') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string, role: 'admin' | 'judge') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to fetch user profile safely
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      
      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }
      
      console.log('Profile retrieved successfully:', data);
      
      return {
        id: data.id,
        username: data.username,
        role: data.role as 'admin' | 'judge',
        name: data.name || undefined,
        email: data.email || undefined,
      };
    } catch (err) {
      console.error('Exception while fetching profile:', err);
      return null;
    }
  };

  // Initialize auth state when the component mounts
  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        
        if (!session) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Avoid synchronous profile fetching in auth callback
        // Use setTimeout to defer it to the next tick
        setTimeout(async () => {
          if (!mounted) return;
          
          try {
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUser(profile);
              }
            } else {
              if (mounted) {
                setUser(null);
              }
            }
          } catch (err) {
            console.error('Error in deferred profile fetch:', err);
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        }, 0);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user && mounted) {
          // Defer profile fetching to avoid potential recursion
          setTimeout(async () => {
            if (!mounted) return;
            
            const profile = await fetchUserProfile(data.session.user.id);
            if (mounted) {
              setUser(profile);
              setIsLoading(false);
            }
          }, 0);
        } else {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'judge'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting login for ${email} as ${role}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error.message);
        setError(error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log('User authenticated, checking profile and role');
        
        // Defer profile fetching to prevent recursion
        const userProfile = await fetchUserProfile(data.user.id);
        
        if (!userProfile) {
          const profileError = 'Failed to fetch user profile';
          console.error(profileError);
          setError(profileError);
          toast({
            title: "Login Failed",
            description: profileError,
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setIsLoading(false);
          return false;
        }

        if (userProfile.role !== role) {
          const roleError = `Invalid role. You are not a ${role}.`;
          console.error(roleError);
          setError(roleError);
          toast({
            title: "Login Failed",
            description: roleError,
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setIsLoading(false);
          return false;
        }

        console.log('Login successful as', role);
        setIsLoading(false);
        toast({
          title: "Success",
          description: `Logged in as ${role}`,
        });
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      console.error('Exception during login:', errorMessage);
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string, username: string, role: 'admin' | 'judge'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to sign up ${email} as ${role}`);
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        setError(error.message);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      console.log('Sign up successful');
      toast({
        title: "Success",
        description: "Account created successfully. You can now log in.",
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
      console.error('Exception during sign up:', errorMessage);
      setError(errorMessage);
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
        error,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
