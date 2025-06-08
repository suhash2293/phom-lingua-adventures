
import { supabase } from '@/integrations/supabase/client';
import * as OTPAuth from 'otpauth';

export interface MFASettings {
  id: string;
  user_id: string;
  totp_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  webauthn_enabled: boolean;
  backup_codes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TrustedDevice {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name: string | null;
  last_used_at: string;
  expires_at: string;
  created_at: string;
}

export interface MFAAuditLog {
  id: string;
  user_id: string;
  action: string;
  method: string | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  created_at: string;
}

export class MFAService {
  /**
   * Get user's MFA settings
   */
  static async getMFASettings(): Promise<MFASettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('mfa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  /**
   * Create or update MFA settings
   */
  static async updateMFASettings(settings: Partial<MFASettings>): Promise<MFASettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('mfa_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Generate TOTP secret for setup
   */
  static generateTOTPSecret(): string {
    // Generate a random 32-character base32 secret
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  /**
   * Generate TOTP QR code URL
   */
  static generateTOTPQRCode(secret: string, email: string): string {
    const totp = new OTPAuth.TOTP({
      issuer: 'PhomShah',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });
    
    const uri = totp.toString();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
  }

  /**
   * Verify TOTP code
   */
  static verifyTOTPCode(secret: string, token: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'PhomShah',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Check current time step and adjacent ones for clock drift
      const delta = totp.validate({ token, window: 1 });
      return delta !== null;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  /**
   * Generate recovery codes
   */
  static async generateRecoveryCodes(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('generate_recovery_codes', {
      target_user_id: user.id
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Verify recovery code
   */
  static async verifyRecoveryCode(code: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('verify_recovery_code', {
      target_user_id: user.id,
      recovery_code: code
    });

    if (error) throw error;
    return data === true;
  }

  /**
   * Get device fingerprint
   */
  static getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('PhomShah', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  /**
   * Check if device is trusted
   */
  static async isDeviceTrusted(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const fingerprint = this.getDeviceFingerprint();
    
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('id')
      .eq('user_id', user.id)
      .eq('device_fingerprint', fingerprint)
      .gt('expires_at', new Date().toISOString())
      .single();

    return !error && !!data;
  }

  /**
   * Trust current device
   */
  static async trustDevice(deviceName?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fingerprint = this.getDeviceFingerprint();
    
    const { error } = await supabase
      .from('trusted_devices')
      .upsert({
        user_id: user.id,
        device_fingerprint: fingerprint,
        device_name: deviceName || 'Unknown Device',
        last_used_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

    if (error) throw error;
  }

  /**
   * Get trusted devices
   */
  static async getTrustedDevices(): Promise<TrustedDevice[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('last_used_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Remove trusted device
   */
  static async removeTrustedDevice(deviceId: string): Promise<void> {
    const { error } = await supabase
      .from('trusted_devices')
      .delete()
      .eq('id', deviceId);

    if (error) throw error;
  }

  /**
   * Log MFA action
   */
  static async logMFAAction(
    action: string,
    method?: string,
    success: boolean = true
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's IP and user agent (simplified)
    const userAgent = navigator.userAgent;

    const { error } = await supabase
      .from('mfa_audit_log')
      .insert({
        user_id: user.id,
        action,
        method,
        user_agent: userAgent,
        success
      });

    if (error) console.error('Failed to log MFA action:', error);
  }

  /**
   * Get MFA audit log
   */
  static async getMFAAuditLog(limit: number = 50): Promise<MFAAuditLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('mfa_audit_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
