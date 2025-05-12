
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  name?: string;
} | null;

type AuthContextType = {
  user: User;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

// Mock admin email - in a real app, this would come from env or a secure source
const ADMIN_EMAIL = "admin@phomshah.com";

// Context creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    // This would be a Supabase auth check in the real implementation
    const checkSession = () => {
      const savedUser = localStorage.getItem('phomshah_user');
      
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('phomshah_user');
        }
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, []);

  // Mock authentication functions - these would be replaced with Supabase auth
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulating authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login - this would be replaced with Supabase auth
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        isAdmin: email === ADMIN_EMAIL
      };
      
      setUser(mockUser);
      localStorage.setItem('phomshah_user', JSON.stringify(mockUser));
      console.log('User signed in:', mockUser);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulating authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock signup - this would be replaced with Supabase auth
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 9),
        email,
        name,
        isAdmin: email === ADMIN_EMAIL
      };
      
      setUser(mockUser);
      localStorage.setItem('phomshah_user', JSON.stringify(mockUser));
      console.log('User signed up:', mockUser);
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Failed to create account. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Simulating signout delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove user from storage and state
      localStorage.removeItem('phomshah_user');
      setUser(null);
      console.log('User signed out');
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
