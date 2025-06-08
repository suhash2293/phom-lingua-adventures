
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Copy, Check } from 'lucide-react';
import { MFAService } from '@/services/MFAService';

interface TOTPSetupProps {
  userEmail: string;
  onComplete: () => void;
  onCancel: () => void;
}

const TOTPSetup: React.FC<TOTPSetupProps> = ({ userEmail, onComplete, onCancel }) => {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const totpSecret = MFAService.generateTOTPSecret();
    setSecret(totpSecret);
    setQrCodeUrl(MFAService.generateTOTPQRCode(totpSecret, userEmail));
  }, [userEmail]);

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      toast({
        title: "Secret copied",
        description: "The secret key has been copied to your clipboard.",
      });
      setTimeout(() => setSecretCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the secret key.",
        variant: "destructive"
      });
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Verify the TOTP code
      const isValid = MFAService.verifyTOTPCode(secret, verificationCode);
      
      if (!isValid) {
        toast({
          title: "Invalid code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Enable TOTP in settings
      await MFAService.updateMFASettings({
        totp_enabled: true
      });

      // Log the action
      await MFAService.logMFAAction('mfa_enabled', 'totp');

      toast({
        title: "TOTP enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });

      onComplete();
    } catch (error) {
      console.error('Error enabling TOTP:', error);
      toast({
        title: "Setup failed",
        description: "Failed to enable two-factor authentication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Set up Authenticator App
        </CardTitle>
        <CardDescription>
          Use an authenticator app like Google Authenticator or Authy to generate verification codes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Scan this QR code with your authenticator app:
          </p>
          <div className="inline-block p-4 bg-white rounded-lg">
            <img src={qrCodeUrl} alt="TOTP QR Code" className="w-48 h-48" />
          </div>
        </div>

        {/* Manual Secret */}
        <div className="space-y-2">
          <Label>Or enter this secret manually:</Label>
          <div className="flex gap-2">
            <Input
              value={secret}
              readOnly
              className="font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copySecret}
              className="shrink-0"
            >
              {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Verification */}
        <div className="space-y-2">
          <Label htmlFor="verification-code">
            Enter verification code from your app:
          </Label>
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="text-center text-lg font-mono tracking-wider"
          />
        </div>

        <Alert>
          <AlertDescription>
            Make sure to save your recovery codes after enabling TOTP. They can be used to access your account if you lose your authenticator device.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={verifyAndEnable}
            disabled={isVerifying || verificationCode.length !== 6}
            className="flex-1"
          >
            {isVerifying ? "Verifying..." : "Enable TOTP"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TOTPSetup;
