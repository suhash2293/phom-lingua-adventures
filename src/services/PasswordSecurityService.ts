
import { toast } from '@/components/ui/use-toast';

export interface PasswordStrength {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  isStrong: boolean;
}

export interface PasswordSecurityResult {
  isSecure: boolean;
  strength: PasswordStrength;
  isCompromised: boolean;
  errors: string[];
}

export class PasswordSecurityService {
  private static readonly MIN_LENGTH = 8;
  private static readonly MIN_SCORE = 3;

  /**
   * Check if password has been compromised using HaveIBeenPwned API
   */
  static async checkPasswordBreach(password: string): Promise<boolean> {
    try {
      // Create SHA-1 hash of password
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      // Use k-anonymity - only send first 5 characters of hash
      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        console.warn('Could not check password breach status');
        return false; // Don't block user if service is down
      }
      
      const text = await response.text();
      const lines = text.split('\n');
      
      // Check if our password hash suffix appears in the results
      return lines.some(line => line.startsWith(suffix));
    } catch (error) {
      console.error('Error checking password breach:', error);
      return false; // Don't block user on error
    }
  }

  /**
   * Calculate password strength score and provide feedback
   */
  static calculatePasswordStrength(password: string): PasswordStrength {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (!/[a-z]/.test(password)) {
      feedback.push('Add lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Add uppercase letters');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Add numbers');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('Add special characters (!@#$%^&*)');
    } else {
      score += 1;
    }

    // Common patterns check
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeating characters');
      score = Math.max(0, score - 1);
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      feedback.push('Avoid common patterns and words');
      score = Math.max(0, score - 1);
    }

    const isStrong = score >= this.MIN_SCORE && password.length >= this.MIN_LENGTH;

    return {
      score: Math.min(score, 4),
      feedback,
      isStrong
    };
  }

  /**
   * Comprehensive password security validation
   */
  static async validatePassword(password: string): Promise<PasswordSecurityResult> {
    const strength = this.calculatePasswordStrength(password);
    const isCompromised = await this.checkPasswordBreach(password);
    const errors: string[] = [];

    if (!strength.isStrong) {
      errors.push('Password is not strong enough');
      errors.push(...strength.feedback);
    }

    if (isCompromised) {
      errors.push('This password has been found in data breaches. Please choose a different password.');
    }

    return {
      isSecure: strength.isStrong && !isCompromised,
      strength,
      isCompromised,
      errors
    };
  }

  /**
   * Get password strength color for UI
   */
  static getStrengthColor(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-orange-500';
      case 3:
        return 'text-yellow-500';
      case 4:
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Get password strength label for UI
   */
  static getStrengthLabel(score: number): string {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'Unknown';
    }
  }
}
