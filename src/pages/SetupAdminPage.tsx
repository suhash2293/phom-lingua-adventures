
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
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
import { AlertCircle, Info } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const SetupAdminPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const setupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: { email },
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(`${email} has been granted admin access. Please sign out and sign back in to apply the changes.`);
      toast({
        title: "Admin setup successful",
        description: "User has been granted admin access. The user should sign out and sign back in for the changes to take effect.",
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Grant Admin Access'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SetupAdminPage;
