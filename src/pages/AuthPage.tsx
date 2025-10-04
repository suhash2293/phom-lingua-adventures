
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
  
  const { user, signIn, signUp, sendVerificationPin, verifyPin, error, clearError } = useAuth();
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
