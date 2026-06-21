'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Label } from './label';
import { Input } from './input';

interface FieldWrapperProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  help?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
  autoComplete?: string;
  children?: React.ReactNode;
}

export function FieldWrapper({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  help,
  error,
  required = false,
  disabled = false,
  defaultValue,
  className,
  inputClassName,
  autoComplete,
  children,
}: FieldWrapperProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {children || (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          aria-required={required}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            inputClassName
          )}
        />
      )}

      {help && !error && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaFieldProps extends Omit<FieldWrapperProps, 'type' | 'children'> {
  rows?: number;
  maxLength?: number;
}

export function TextareaField({
  id,
  name,
  label,
  placeholder,
  help,
  error,
  required = false,
  disabled = false,
  defaultValue,
  className,
  rows = 4,
  maxLength,
}: TextareaFieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
      />

      {help && !error && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
