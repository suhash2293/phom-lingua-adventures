
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

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
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
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
      setError(err.message || 'Failed to create account. Please try again.');
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
