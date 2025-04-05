
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

  // Initialize auth state when the component mounts
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          // Fetch the user profile from our profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single<ProfileData>();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setUser(null);
          } else if (profile) {
            // Convert Supabase user to our app's User type
            setUser({
              id: profile.id,
              username: profile.username,
              role: profile.role as 'admin' | 'judge',
              name: profile.name || undefined,
              email: profile.email || undefined,
            });
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch the user profile from our profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single<ProfileData>();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setUser(null);
        } else if (profile) {
          // Convert Supabase user to our app's User type
          setUser({
            id: profile.id,
            username: profile.username,
            role: profile.role as 'admin' | 'judge',
            name: profile.name || undefined,
            email: profile.email || undefined,
          });
        }
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
        // Check if user has the correct role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single<ProfileData>();

        if (profileError || !profile) {
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

        if (profile.role !== role) {
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
