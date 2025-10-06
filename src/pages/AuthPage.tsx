
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Loader2, Shield } from "lucide-react";
import SecurePasswordInput from '@/components/auth/SecurePasswordInput';
import { PasswordSecurityResult } from '@/services/PasswordSecurityService';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from '@/components/ui/separator';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [passwordSecurity, setPasswordSecurity] = useState<PasswordSecurityResult | null>(null);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [pin, setPin] = useState('');
  
  const { user, signIn, signUp, sendVerificationPin, verifyPin, signInWithGoogle, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Clear any errors when switching between login/signup
  useEffect(() => {
    clearError();
    setShowSignupSuccess(false);
    setPasswordSecurity(null);
    setShowPinVerification(false);
    setPin('');
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
        const result = await signIn(email, password);
        
        // Don't navigate if login failed
        if (result.error) {
          toast({
            title: "Sign In Failed",
            description: result.error,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
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

        const signUpResult = await signUp(email, password, name);
        
        if (signUpResult.error) {
          toast({
            title: "Sign Up Failed", 
            description: signUpResult.error,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        setVerificationEmail(email);
        setShowPinVerification(true);
        
        // Send verification PIN immediately after signup
        const pinResult = await sendVerificationPin(email);
        
        // If PIN sending fails, stay on verification screen with error
        if (pinResult.error) {
          // Error toast is already shown by sendVerificationPin
          // User can still try to resend
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await verifyPin(verificationEmail, pin);
      toast({
        title: "Email verified!",
        description: "You can now sign in with your account.",
      });
      
      // Reset to login mode after successful verification
      setShowPinVerification(false);
      setIsLogin(true);
      setEmail(verificationEmail);
      setPassword('');
      setPin('');
    } catch (err) {
      console.error('PIN verification error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPin = async () => {
    try {
      const result = await sendVerificationPin(verificationEmail);
      if (result.error) {
        toast({
          title: "Resend Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Resend PIN error:', err);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword(''); // Clear password when switching modes
    setPasswordSecurity(null);
    setShowPinVerification(false);
    setPin('');
    // Error is cleared in the useEffect
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message || 'Failed to sign in with Google',
        variant: "destructive"
      });
    }
  };

  const goToSetupAdmin = () => {
    navigate('/setup-admin');
  };

  const canSubmit = isLogin || (passwordSecurity?.isSecure ?? false);

  // Check if the error is related to leaked passwords
  const isLeakedPasswordError = error?.toLowerCase().includes('breach') || 
                               error?.toLowerCase().includes('compromised') || 
                               error?.toLowerCase().includes('leaked') ||
                                error?.toLowerCase().includes('pwned');

  // Show PIN verification form if needed
  if (showPinVerification) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Verify Your Email
            </CardTitle>
            <CardDescription>
              We've sent a PIN to {verificationEmail}. Enter it below to verify your account.
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
          
          <form onSubmit={handlePinVerification}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Verification PIN</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={pin}
                    onChange={setPin}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enter the PIN sent to your email
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || (pin.length !== 4 && pin.length !== 6)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify PIN'}
              </Button>
              
              <Button 
                type="button" 
                variant="link" 
                onClick={handleResendPin}
                className="w-full"
              >
                Didn't receive the PIN? Resend
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPinVerification(false)}
                className="w-full"
              >
                Back to Sign Up
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

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
          <div className="px-6 mb-4">
            <Alert variant="destructive" className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
              {isLeakedPasswordError ? (
                <Shield className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle className="font-semibold">
                {isLeakedPasswordError ? 'Security Alert' : 'Authentication Error'}
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm">{error}</AlertDescription>
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
            
            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
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
