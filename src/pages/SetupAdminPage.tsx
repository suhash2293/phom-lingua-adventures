
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const SetupAdminPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pre-fill with the current user's email if available
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const setupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Calling setup-admin function with email:', email);
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: { email },
      });

      console.log('Response:', data, error);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(`${email} has been granted admin access. Please sign out and sign back in to apply the changes.`);
      toast({
        title: "Admin setup successful",
        description: "User has been granted admin access. Please sign out and sign back in for the changes to take effect.",
      });
    } catch (err: any) {
      console.error('Error setting up admin:', err);
      setError(err.message || 'Failed to setup admin access');
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: err.message || 'Something went wrong while setting up admin access',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin Setup</CardTitle>
            <CardDescription>
              Grant admin privileges to a user by email address
            </CardDescription>
          </CardHeader>
          
          {error && (
            <div className="px-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          
          {success && (
            <div className="px-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <form onSubmit={setupAdmin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">User Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter user email to grant admin access"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : 'Grant Admin Access'}
              </Button>
              {success && (
                <Button type="button" variant="outline" onClick={handleSignOut} className="w-full">
                  Sign Out Now
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SetupAdminPage;
