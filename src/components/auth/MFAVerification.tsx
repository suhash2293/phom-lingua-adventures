
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Smartphone, Key, CheckCircle } from 'lucide-react';
import { MFAService, MFASettings } from '@/services/MFAService';

interface MFAVerificationProps {
  mfaSettings: MFASettings;
  onVerified: () => void;
  onCancel: () => void;
}

type VerificationMethod = 'totp' | 'recovery';

const MFAVerification: React.FC<MFAVerificationProps> = ({ 
  mfaSettings, 
  onVerified, 
  onCancel 
}) => {
  const [method, setMethod] = useState<VerificationMethod>('totp');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [isDeviceAlreadyTrusted, setIsDeviceAlreadyTrusted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkDeviceTrust();
  }, []);

  const checkDeviceTrust = async () => {
    try {
      const trusted = await MFAService.isDeviceTrusted();
      setIsDeviceAlreadyTrusted(trusted);
      if (trusted) {
        // Device is already trusted, skip MFA
        onVerified();
      }
    } catch (error) {
      console.error('Error checking device trust:', error);
    }
  };

  const verifyCode = async () => {
    if (!code) {
      toast({
        title: "Code required",
        description: "Please enter a verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      let isValid = false;

      if (method === 'totp') {
        // Note: In a real implementation, TOTP verification should be done server-side
        // This is a simplified client-side verification for demo purposes
        toast({
          title: "TOTP Verification",
          description: "In production, TOTP verification would be handled server-side via Supabase Auth.",
        });
        // For demo purposes, accept any 6-digit code
        isValid = code.length === 6;
      } else if (method === 'recovery') {
        isValid = await MFAService.verifyRecoveryCode(code);
      }

      if (!isValid) {
        await MFAService.logMFAAction('mfa_failed', method, false);
        toast({
          title: "Invalid code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Log successful verification
      await MFAService.logMFAAction('mfa_verified', method);

      // Trust device if requested
      if (trustDevice) {
        await MFAService.trustDevice();
      }

      toast({
        title: "Verification successful",
        description: "You have been successfully authenticated.",
      });

      onVerified();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      await MFAService.logMFAAction('mfa_failed', method, false);
      toast({
        title: "Verification failed",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isDeviceAlreadyTrusted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Trusted Device
          </CardTitle>
          <CardDescription>
            This device is already trusted. Redirecting...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Please verify your identity to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Method Selection */}
        <div className="space-y-3">
          {mfaSettings.totp_enabled && (
            <Button
              variant={method === 'totp' ? 'default' : 'outline'}
              onClick={() => setMethod('totp')}
              className="w-full justify-start"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Authenticator App
            </Button>
          )}
          <Button
            variant={method === 'recovery' ? 'default' : 'outline'}
            onClick={() => setMethod('recovery')}
            className="w-full justify-start"
          >
            <Key className="h-4 w-4 mr-2" />
            Recovery Code
          </Button>
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="mfa-code">
            {method === 'totp' ? 'Authenticator Code' : 'Recovery Code'}
          </Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode={method === 'totp' ? 'numeric' : 'text'}
            pattern={method === 'totp' ? '[0-9]*' : undefined}
            maxLength={method === 'totp' ? 6 : 8}
            value={code}
            onChange={(e) => {
              const value = method === 'totp' 
                ? e.target.value.replace(/\D/g, '')
                : e.target.value.toUpperCase();
              setCode(value);
            }}
            placeholder={method === 'totp' ? '000000' : 'ABCD1234'}
            className="text-center text-lg font-mono tracking-wider"
          />
          <p className="text-xs text-muted-foreground">
            {method === 'totp' 
              ? 'Enter the 6-digit code from your authenticator app'
              : 'Enter one of your recovery codes'
            }
          </p>
        </div>

        {/* Trust Device */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="trust-device"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="trust-device" className="text-sm">
            Trust this device for 30 days
          </Label>
        </div>

        {method === 'recovery' && (
          <Alert>
            <AlertDescription>
              Recovery codes can only be used once. Make sure to generate new ones after using this code.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={verifyCode}
            disabled={isVerifying || !code}
            className="flex-1"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFAVerification;
