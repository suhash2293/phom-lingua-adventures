
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { PasswordSecurityService, PasswordSecurityResult } from '@/services/PasswordSecurityService';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onSecurityCheck?: (result: PasswordSecurityResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const SecurePasswordInput: React.FC<SecurePasswordInputProps> = ({
  value,
  onChange,
  onSecurityCheck,
  placeholder = "Enter your password",
  label = "Password",
  required = false,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [securityResult, setSecurityResult] = useState<PasswordSecurityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!value) {
      setSecurityResult(null);
      onSecurityCheck?.(null as any);
      return;
    }

    const checkPassword = async () => {
      setIsChecking(true);
      try {
        const result = await PasswordSecurityService.validatePassword(value);
        setSecurityResult(result);
        onSecurityCheck?.(result);
      } catch (error) {
        console.error('Error checking password security:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the security check
    const timeoutId = setTimeout(checkPassword, 500);
    return () => clearTimeout(timeoutId);
  }, [value, onSecurityCheck]);

  return (
    <div className="space-y-2">
      <Label htmlFor="secure-password">{label}</Label>
      <div className="relative">
        <Input
          id="secure-password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {securityResult && (
        <PasswordStrengthIndicator
          password={value}
          strength={securityResult.strength}
          isCompromised={securityResult.isCompromised}
        />
      )}
      
      {isChecking && (
        <p className="text-sm text-muted-foreground">Checking password security...</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters
      </p>
    </div>
  );
};

export default SecurePasswordInput;
