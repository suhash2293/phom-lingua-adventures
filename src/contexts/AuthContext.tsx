import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { PasswordSecurityService } from '@/services/PasswordSecurityService';

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
  clearError: () => void;
};

// Context creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper function to map Supabase auth errors to user-friendly messages
  const mapAuthError = (error: any): string => {
    const errorMessage = error?.message || '';
    const errorCode = error?.error_code || error?.code || '';
    
    // Log the actual error for debugging
    console.log('Auth error details:', { message: errorMessage, code: errorCode, error });
    
    // Handle leaked password errors from Supabase
    if (errorMessage.includes('leaked') || errorMessage.includes('compromised') || errorMessage.includes('pwned')) {
      return 'This password has been found in data breaches and cannot be used. Please choose a different password.';
    }
    
    // Handle authentication failures - multiple patterns
    if (errorMessage.includes('Invalid login credentials') || 
        errorMessage.includes('invalid_grant') ||
        errorMessage.includes('invalid_credentials') ||
        errorMessage.includes('Invalid email or password') ||
        errorMessage.includes('Wrong email or password') ||
        errorCode === 'invalid_grant' ||
        errorCode === 'invalid_credentials') {
      return 'Incorrect email or password. Please check your credentials and try again.';
    }
    
    // Handle email verification issues
    if (errorMessage.includes('Email not confirmed') || 
        errorMessage.includes('email_not_confirmed') ||
        errorCode === 'email_not_confirmed') {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    // Handle existing user registration
    if (errorMessage.includes('Email already registered') || 
        errorMessage.includes('User already registered') ||
        errorMessage.includes('already_registered') ||
        errorCode === 'user_already_exists') {
      return 'An account with this email already exists. Please sign in instead.';
    }
    
    // Handle password requirements
    if (errorMessage.includes('Password should be at least') ||
        errorMessage.includes('password_too_short') ||
        errorCode === 'weak_password') {
      return 'Password must be at least 6 characters long.';
    }
    
    // Handle rate limiting
    if (errorMessage.includes('Too many requests') ||
        errorMessage.includes('rate_limit') ||
        errorMessage.includes('too_many_requests') ||
        errorCode === 'too_many_requests') {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    
    // Handle network issues
    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Default fallback with more helpful message
    if (errorMessage) {
      return `Authentication failed: ${errorMessage}`;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  // Check for existing session on mount and setup auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session && session.user) {
          // Immediately set basic user info from auth
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.name,
            isAdmin: false // Default value until we fetch the profile
          });
          
          // Fetch profile in a separate call
          setTimeout(async () => {
            try {
              // Get user profile to check admin status
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();
                
              if (profileError) {
                console.error('Error fetching user profile:', profileError);
                
                // If the profile doesn't exist but we have a matching email in profiles, update that profile
                const { data: emailProfile, error: emailProfileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('email', session.user.email)
                  .single();
                  
                if (!emailProfileError && emailProfile) {
                  console.log('Found profile by email, updating ID');
                  
                  // Update the profile ID to match the auth user ID
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ id: session.user.id })
                    .eq('email', session.user.email);
                    
                  if (updateError) {
                    console.error('Error updating profile ID:', updateError);
                  } else {
                    setUser(prev => ({
                      ...prev!,
                      isAdmin: emailProfile.is_admin || false
                    }));
                    return;
                  }
                }
                
                // If email profile not found or update failed, create a new profile
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({ 
                    id: session.user.id, 
                    email: session.user.email,
                    is_admin: false 
                  });
                  
                if (insertError) {
                  console.error('Error creating new profile:', insertError);
                }
              } else {
                console.log('Profile data:', profile);
                
                setUser(prev => ({
                  ...prev!,
                  isAdmin: profile?.is_admin || false
                }));
              }
            } catch (err) {
              console.error('Error processing user profile:', err);
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Initial session:', session?.user?.email || 'No session');
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Basic user info is set, detailed profile will be handled by the state change listener
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Signing in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // User is set by the onAuthStateChange listener
      console.log('User signed in:', data);
    } catch (err: any) {
      console.error('Sign in error:', err);
      const friendlyError = mapAuthError(err);
      setError(friendlyError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Signing up with:', email);
      
      // Validate password security before signup (client-side check for immediate feedback)
      const securityResult = await PasswordSecurityService.validatePassword(password);
      
      if (!securityResult.isSecure) {
        const errorMessage = securityResult.errors.join(' ');
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email for a confirmation link.",
      });
      
      console.log('User signed up:', data);
    } catch (err: any) {
      console.error('Sign up error:', err);
      const friendlyError = mapAuthError(err);
      setError(friendlyError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // User is cleared by the onAuthStateChange listener
      console.log('User signed out');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out.');
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
    error,
    clearError
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
