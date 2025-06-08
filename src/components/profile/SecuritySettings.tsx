
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Smartphone, Key, Monitor, AlertTriangle, CheckCircle } from 'lucide-react';
import { MFAService, MFASettings, TrustedDevice } from '@/services/MFAService';
import TOTPSetup from '@/components/auth/TOTPSetup';
import RecoveryCodes from '@/components/auth/RecoveryCodes';

interface SecuritySettingsProps {
  userEmail: string;
}

type View = 'main' | 'totp-setup' | 'recovery-codes';

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ userEmail }) => {
  const [view, setView] = useState<View>('main');
  const [mfaSettings, setMfaSettings] = useState<MFASettings | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      const [settings, devices] = await Promise.all([
        MFAService.getMFASettings(),
        MFAService.getTrustedDevices()
      ]);
      
      setMfaSettings(settings);
      setTrustedDevices(devices);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Loading failed",
        description: "Failed to load security settings. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTOTP = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    try {
      await MFAService.updateMFASettings({
        totp_enabled: false
      });

      await MFAService.logMFAAction('mfa_disabled', 'totp');

      toast({
        title: "TOTP disabled",
        description: "Two-factor authentication has been disabled.",
      });

      await loadSecurityData();
    } catch (error) {
      console.error('Error disabling TOTP:', error);
      toast({
        title: "Failed to disable",
        description: "Failed to disable two-factor authentication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeTrustedDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this trusted device?')) {
      return;
    }

    try {
      await MFAService.removeTrustedDevice(deviceId);
      toast({
        title: "Device removed",
        description: "The trusted device has been removed.",
      });
      await loadSecurityData();
    } catch (error) {
      console.error('Error removing device:', error);
      toast({
        title: "Removal failed",
        description: "Failed to remove trusted device. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading security settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (view === 'totp-setup') {
    return (
      <TOTPSetup
        userEmail={userEmail}
        onComplete={() => {
          setView('recovery-codes');
          loadSecurityData();
        }}
        onCancel={() => setView('main')}
      />
    );
  }

  if (view === 'recovery-codes') {
    return (
      <RecoveryCodes
        onComplete={() => setView('main')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* MFA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaSettings?.totp_enabled ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is enabled and protecting your account.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is not enabled. Your account security could be improved.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {/* TOTP */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">
                    Use Google Authenticator, Authy, or similar apps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mfaSettings?.totp_enabled ? (
                  <>
                    <span className="text-sm text-green-600 font-medium">Enabled</span>
                    <Button variant="outline" size="sm" onClick={disableTOTP}>
                      Disable
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setView('totp-setup')}>
                    Set up
                  </Button>
                )}
              </div>
            </div>

            {/* Recovery Codes */}
            {mfaSettings?.totp_enabled && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Recovery Codes</p>
                    <p className="text-sm text-muted-foreground">
                      Backup codes for account recovery
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setView('recovery-codes')}
                >
                  Manage
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Trusted Devices
          </CardTitle>
          <CardDescription>
            Devices that don't require two-factor authentication for 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trustedDevices.length === 0 ? (
            <p className="text-muted-foreground">No trusted devices found.</p>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {device.device_name || 'Unknown Device'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last used: {formatDate(device.last_used_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires: {formatDate(device.expires_at)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTrustedDevice(device.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
