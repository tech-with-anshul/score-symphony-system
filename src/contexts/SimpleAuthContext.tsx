
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';

// Predefined users for the system
const PREDEFINED_USERS = [
  // Admin user
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
  
  // Judge users
  { id: '2', username: 'judge1', password: 'judge123', role: 'judge' as const, name: 'Judge One' },
  { id: '3', username: 'judge2', password: 'judge123', role: 'judge' as const, name: 'Judge Two' },
  { id: '4', username: 'judge3', password: 'judge123', role: 'judge' as const, name: 'Judge Three' },
  { id: '5', username: 'judge4', password: 'judge123', role: 'judge' as const, name: 'Judge Four' },
  { id: '6', username: 'judge5', password: 'judge123', role: 'judge' as const, name: 'Judge Five' },
  { id: '7', username: 'judge6', password: 'judge123', role: 'judge' as const, name: 'Judge Six' },
  { id: '8', username: 'judge7', password: 'judge123', role: 'judge' as const, name: 'Judge Seven' },
];

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: 'admin' | 'judge') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const SimpleAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider = ({ children }: SimpleAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for saved user in localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('hackathon_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('hackathon_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, role: 'admin' | 'judge'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundUser = PREDEFINED_USERS.find(
        u => u.username === username && u.password === password && u.role === role
      );
      
      if (!foundUser) {
        setError(`Invalid credentials or ${role} role not found`);
        setIsLoading(false);
        return false;
      }
      
      // Create user object without password
      const userToSave: User = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
      };
      
      setUser(userToSave);
      
      // Save to localStorage
      localStorage.setItem('hackathon_user', JSON.stringify(userToSave));
      
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hackathon_user');
  };

  const isAuthenticated = user !== null;

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
        error,
      }}
    >
      {children}
    </SimpleAuthContext.Provider>
  );
};
