import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type FeedbackVariant = 'success' | 'error' | 'info';

interface FormFeedbackProps {
  message: string;
  variant?: FeedbackVariant;
  className?: string;
}

const variants = {
  success: {
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive',
    iconClassName: 'text-destructive',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
};

export function FormFeedback({
  message,
  variant = 'error',
  className,
}: FormFeedbackProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-4 w-4 flex-shrink-0', config.iconClassName)} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

interface FieldErrorProps {
  id: string;
  message?: string;
  className?: string;
}

export function FieldError({ id, message, className }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn('text-sm text-destructive mt-1', className)}
    >
      {message}
    </p>
  );
}

interface FieldHelpProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldHelp({ id, children, className }: FieldHelpProps) {
  return (
    <p
      id={id}
      className={cn('text-sm text-muted-foreground mt-1', className)}
    >
      {children}
    </p>
  );
}
