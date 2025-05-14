
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const setupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Setting up admin for email:', email);
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: { email },
      });

      console.log('Response:', data, error);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(`${email} has been granted admin access. You can now sign in with this account.`);
      toast({
        title: "Admin setup successful",
        description: "Your account has been granted admin access. You can now sign in.",
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

  const goToSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Admin Setup</CardTitle>
            <CardDescription>
              Grant admin privileges to your account by email address
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
                <Label htmlFor="admin-email">Your Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to grant admin access"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Note: You must have already created an account with this email.
                </p>
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
                <Button type="button" variant="outline" onClick={goToSignIn} className="w-full">
                  Go to Sign In
                </Button>
              )}
              {!success && (
                <Button type="button" variant="link" onClick={goToSignIn} className="w-full">
                  Back to Sign In
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
