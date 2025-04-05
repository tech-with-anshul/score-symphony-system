import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

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
  const fetchUserProfile = async (userId: string) => {
    try {
      // Use .eq and .maybeSingle instead of .single to prevent errors when no profile is found
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle<ProfileData>();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      if (!profile) {
        console.error('No profile found for user:', userId);
        return null;
      }

      return {
        id: profile.id,
        username: profile.username,
        role: profile.role as 'admin' | 'judge',
        name: profile.name || undefined,
        email: profile.email || undefined,
      };
    } catch (err) {
      console.error('Exception while fetching profile:', err);
      return null;
    }
  };

  // Initialize auth state when the component mounts
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Use a synchronous update for the session change
        if (!session) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Set loading state
        setIsLoading(true);
        
        // Use setTimeout to defer the profile fetch to avoid potential recursion
        setTimeout(async () => {
          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user.id);
            setUser(userProfile);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }, 0);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setUser(userProfile);
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'judge') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
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
        // Check if user has the correct role using our helper function
        const userProfile = await fetchUserProfile(data.user.id);
        
        if (!userProfile) {
          setError('Failed to fetch user profile');
          toast({
            title: "Login Failed",
            description: 'Failed to fetch user profile',
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setIsLoading(false);
          return false;
        }

        if (userProfile.role !== role) {
          setError(`Invalid role. You are not a ${role}.`);
          toast({
            title: "Login Failed",
            description: `Invalid role. You are not a ${role}.`,
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setIsLoading(false);
          return false;
        }

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

  const signUp = async (email: string, password: string, username: string, role: 'admin' | 'judge') => {
    setIsLoading(true);
    setError(null);
    
    try {
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
        setError(error.message);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      toast({
        title: "Success",
        description: "Account created successfully. You can now log in.",
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
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
