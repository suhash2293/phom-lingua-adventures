
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import SecurePasswordInput from '@/components/auth/SecurePasswordInput';
import { PasswordSecurityResult } from '@/services/PasswordSecurityService';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [passwordSecurity, setPasswordSecurity] = useState<PasswordSecurityResult | null>(null);
  
  const { user, signIn, signUp, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Clear any errors when switching between login/signup
  useEffect(() => {
    clearError();
    setShowSignupSuccess(false);
    setPasswordSecurity(null);
  }, [isLogin, clearError]);

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate('/');
      } else {
        // Check password security for signup
        if (passwordSecurity && !passwordSecurity.isSecure) {
          toast({
            title: "Password Security Issue",
            description: "Please choose a stronger password before creating your account.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        await signUp(email, password, name);
        setShowSignupSuccess(true);
        // Don't navigate immediately after signup as we want to show the success message
      }
    } catch (err) {
      // Error is already set in the AuthContext
      console.error('Authentication error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword(''); // Clear password when switching modes
    setPasswordSecurity(null);
    // Error is cleared in the useEffect
  };

  const goToSetupAdmin = () => {
    navigate('/setup-admin');
  };

  const canSubmit = isLogin || (passwordSecurity?.isSecure ?? false);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Sign In' : 'Create an Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Fill in the information to create your secure account'}
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
        
        {showSignupSuccess && !isLogin && (
          <div className="px-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Account Created!</AlertTitle>
              <AlertDescription>
                Please check your email for a confirmation link. If you don't receive it, you can try signing in anyway.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              {isLogin ? (
                <>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </>
              ) : (
                <SecurePasswordInput
                  value={password}
                  onChange={setPassword}
                  onSecurityCheck={setPasswordSecurity}
                  required
                />
              )}
              {isLogin && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || (!isLogin && !canSubmit)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
            
            <Button 
              type="button" 
              variant="link" 
              onClick={toggleAuthMode} 
              className="w-full"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </Button>
            
            {isLogin && (
              <Button
                type="button"
                variant="outline"
                onClick={goToSetupAdmin}
                className="w-full mt-2"
              >
                Setup Admin Account
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthPage;
