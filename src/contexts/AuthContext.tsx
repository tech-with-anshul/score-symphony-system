
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: 'admin' | 'judge') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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

// Mock users (in a real app this would be from a backend)
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
  },
  {
    id: '2',
    username: 'judge1',
    password: 'judge123',
    role: 'judge',
    name: 'Judge One',
    email: 'judge1@example.com',
  },
  {
    id: '3',
    username: 'judge2',
    password: 'judge123',
    role: 'judge',
    name: 'Judge Two',
    email: 'judge2@example.com',
  },
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('hackathon_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('hackathon_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, role: 'admin' | 'judge') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
      const foundUser = mockUsers.find(
        u => u.username === username && u.password === password && u.role === role
      );
      
      if (foundUser) {
        // Create user object without password
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem('hackathon_user', JSON.stringify(userWithoutPassword));
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
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
    <AuthContext.Provider
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
    </AuthContext.Provider>
  );
};
