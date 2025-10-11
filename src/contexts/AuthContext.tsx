import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';
import { PasswordSecurityService } from '@/services/PasswordSecurityService';
import { HybridProgressService } from '@/services/HybridProgressService';

// Types
export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  name?: string;
} | null;

type AuthContextType = {
  user: User;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  sendVerificationPin: (email: string) => Promise<{ error?: string }>;
  verifyPin: (email: string, pin: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
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
      return "Your email isn't verified yet. Please enter the PIN we sent to your email to verify your account.";
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
          
          
          // Fetch profile in a separate call to avoid auth deadlock
          setTimeout(async () => {
            try {
              // Step 1: Try to fetch profile by ID
              const { data: profileById, error: profileByIdError } = await supabase
                .from('profiles')
                .select('id, email, is_admin')
                .eq('id', session.user.id)
                .single();
                
              if (profileById) {
                console.log('Profile found by ID:', profileById);
                setUser(prev => ({
                  ...prev!,
                  isAdmin: profileById.is_admin || false
                }));
                return;
              }
              
              // Step 2: Profile not found by ID, check by email
              const { data: profileByEmail, error: profileByEmailError } = await supabase
                .from('profiles')
                .select('id, email, is_admin')
                .eq('email', session.user.email)
                .single();
              
              // Step 3: If profile exists by email and either ID mismatch or is admin, reconcile using edge function
              if (profileByEmail && (profileByEmail.id !== session.user.id || profileByEmail.is_admin)) {
                console.log('Profile found by email with mismatch or admin status, reconciling...', profileByEmail);
                
                // Use setup-admin edge function to reconcile profile with service role
                const { error: reconcileError } = await supabase.functions.invoke('setup-admin', {
                  body: { email: session.user.email }
                });
                
                if (reconcileError) {
                  console.error('Error reconciling admin profile:', reconcileError);
                } else {
                  console.log('Profile reconciled successfully');
                }
                
                // Re-fetch by ID to get updated admin status
                const { data: reconciledProfile } = await supabase
                  .from('profiles')
                  .select('is_admin')
                  .eq('id', session.user.id)
                  .single();
                  
                setUser(prev => ({
                  ...prev!,
                  isAdmin: reconciledProfile?.is_admin || false
                }));
                return;
              }
              
              // Step 4: No profile exists at all, create a new one
              console.log('No profile found, creating new profile');
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({ 
                  id: session.user.id, 
                  email: session.user.email,
                  is_admin: false 
                });
                
              if (insertError) {
                console.error('Error creating new profile:', insertError);
              } else {
                console.log('New profile created');
                setUser(prev => ({
                  ...prev!,
                  isAdmin: false
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
      
      if (error) {
        console.error('Sign in error:', error);
        const friendlyError = mapAuthError(error);
        setError(friendlyError);
        return { error: friendlyError };
      }
      
      // User is set by the onAuthStateChange listener
      console.log('User signed in:', data);
      return { error: undefined };
    } catch (err: any) {
      console.error('Sign in exception:', err);
      const friendlyError = mapAuthError(err);
      setError(friendlyError);
      return { error: friendlyError };
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
        return { error: errorMessage };
      }
      
      // Standard sign up; PIN verification handled via edge function
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { name }
        }
      });
      
      if (error) {
        const friendlyError = mapAuthError(error);
        setError(friendlyError);
        return { error: friendlyError };
      }
      
      // Don't show the email confirmation toast since we're using PIN verification
      
      console.log('User signed up:', data);
      return { error: undefined };
    } catch (err: any) {
      console.error('Sign up error:', err);
      const friendlyError = mapAuthError(err);
      setError(friendlyError);
      return { error: friendlyError };
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationPin = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending verification PIN to:', email);
      
      const { data, error } = await supabase.functions.invoke('send-verification-pin', {
        body: { email }
      });
      
      console.log('Edge function response:', { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
        const errorMessage = error?.message || 'Failed to send verification PIN. Please try again.';
        setError(errorMessage);
        toast({
          title: "Failed to send PIN",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: errorMessage };
      }
      
      if (data?.error) {
        console.error('Server error:', data.error);
        const errorMessage = data.error;
        setError(errorMessage);
        toast({
          title: "Failed to send PIN",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: errorMessage };
      }
      
      console.log('PIN sent successfully');
      
      toast({
        title: "Verification PIN sent!",
        description: "Please check your email for the PIN.",
      });
      return { error: undefined };
    } catch (err: any) {
      console.error('Send PIN error:', err);
      const errorMessage = err?.message || 'Failed to send verification PIN. Please try again.';
      setError(errorMessage);
      toast({
        title: "Failed to send PIN",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (email: string, pin: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Verifying PIN for:', email);
      
      const { data, error } = await supabase.functions.invoke('verify-pin', {
        body: { email, pin }
      });
      
      console.log('Verify PIN response:', { data, error });
      
      if (error) {
        console.error('Edge function error:', error);
        const errorMessage = error?.message || 'Failed to verify PIN';
        setError(errorMessage);
        return { error: errorMessage };
      }
      
      if (data?.error) {
        console.error('Server verification error:', data.error);
        setError(data.error);
        return { error: data.error };
      }
      
      if (!data?.success) {
        const errorMessage = 'PIN verification failed';
        setError(errorMessage);
        return { error: errorMessage };
      }
      
      console.log('PIN verified successfully, refreshing session...');
      
      // Refresh the session to get the updated email_verified status
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) {
        console.error('Session refresh error:', sessionError);
      } else {
        console.log('Session refreshed successfully');
      }
      
      toast({
        title: "Email verified!",
        description: "Your account has been verified successfully.",
      });
      return { error: undefined };
    } catch (err: any) {
      console.error('Verify PIN error:', err);
      const errorMessage = err?.message || 'Failed to verify PIN';
      setError(errorMessage);
      return { error: errorMessage };
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

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      const friendlyError = mapAuthError(error);
      setError(friendlyError);
      throw error;
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    sendVerificationPin,
    verifyPin,
    signInWithGoogle,
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
