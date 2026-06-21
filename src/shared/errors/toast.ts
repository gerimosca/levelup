import { toast } from 'sonner';

import { getErrorMessage } from './messages';
import { AppError } from './types';

/**
 * Show an error toast with localized message
 *
 * @example
 * ```typescript
 * 'use client';
 *
 * if (!result.success) {
 *   showError(result.error, 'es');
 * }
 * ```
 */
export function showError(error: AppError, locale: string = 'en'): void {
  const message = getErrorMessage(error.code, locale);

  toast.error(message, {
    description: error.details?.description as string | undefined,
  });
}

/**
 * Show error by code directly
 *
 * @example
 * ```typescript
 * showErrorByCode('AUTH_1001', 'es');
 * ```
 */
export function showErrorByCode(code: string, locale: string = 'en'): void {
  const message = getErrorMessage(code, locale);
  toast.error(message);
}

/**
 * Show a success toast
 *
 * @example
 * ```typescript
 * showSuccess('Profile updated successfully');
 * ```
 */
export function showSuccess(message: string, description?: string): void {
  toast.success(message, { description });
}

/**
 * Show an info toast
 *
 * @example
 * ```typescript
 * showInfo('Processing your request...');
 * ```
 */
export function showInfo(message: string, description?: string): void {
  toast.info(message, { description });
}

/**
 * Show a warning toast
 *
 * @example
 * ```typescript
 * showWarning('Your session will expire soon');
 * ```
 */
export function showWarning(message: string, description?: string): void {
  toast.warning(message, { description });
}
