
import React from 'react';
import { PasswordStrength, PasswordSecurityService } from '@/services/PasswordSecurityService';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrength;
  isCompromised?: boolean;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  isCompromised = false,
  className = ''
}) => {
  if (!password) return null;

  const strengthColor = PasswordSecurityService.getStrengthColor(strength.score);
  const strengthLabel = PasswordSecurityService.getStrengthLabel(strength.score);
  const progressValue = (strength.score / 4) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span className={strengthColor}>{strengthLabel}</span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2"
        />
      </div>

      {/* Security Status */}
      {isCompromised && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            This password has been found in data breaches. Please choose a different password.
          </AlertDescription>
        </Alert>
      )}

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">To improve your password:</p>
          <ul className="text-sm space-y-1">
            {strength.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center gap-2 text-orange-600">
                <div className="w-1 h-1 bg-orange-600 rounded-full" />
                {feedback}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strong Password Confirmation */}
      {strength.isStrong && !isCompromised && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>Strong and secure password</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
