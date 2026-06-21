'use client';

import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
  error?: string;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  checks: { label: string; passed: boolean }[];
} {
  const checks = [
    { label: 'minLength', passed: password.length >= 6 },
    { label: 'hasNumber', passed: /\d/.test(password) },
    { label: 'hasLetter', passed: /[a-zA-Z]/.test(password) },
    { label: 'hasSpecial', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const score = checks.filter((c) => c.passed).length;
  let label = 'weak';
  if (score >= 4) label = 'strong';
  else if (score >= 3) label = 'medium';

  return { score, label, checks };
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, error, className, ...props }, ref) => {
    const t = useTranslations('auth');
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    const strength = showStrength ? getPasswordStrength(password) : null;

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              props.onChange?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        {showStrength && password && strength && (
          <div className="space-y-2">
            {/* Strength bar */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    strength.score >= level
                      ? strength.label === 'strong'
                        ? 'bg-green-500'
                        : strength.label === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>

            {/* Requirements checklist */}
            <ul className="space-y-1">
              {strength.checks.map((check) => (
                <li
                  key={check.label}
                  className={cn(
                    'flex items-center gap-2 text-xs',
                    check.passed ? 'text-green-600' : 'text-muted-foreground'
                  )}
                >
                  {check.passed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {t(`passwordRequirements.${check.label}`)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
