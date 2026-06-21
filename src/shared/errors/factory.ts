import { ZodError } from 'zod';

import { BaseErrorCode } from './codes';
import { AppError } from './types';

/**
 * Create an application error
 *
 * @example
 * ```typescript
 * const error = createError('AUTH_1001', 'Invalid credentials');
 * const errorWithDetails = createError('BILL_3001', 'No credits', { remaining: 0 });
 * ```
 */
export function createError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): AppError {
  return {
    code,
    message,
    ...(details && { details }),
  };
}

/**
 * Convert a Zod validation error to an AppError
 *
 * Takes the first error from the Zod error and maps it to
 * the appropriate validation error code.
 *
 * @example
 * ```typescript
 * const result = schema.safeParse(input);
 * if (!result.success) {
 *   return { success: false, error: fromZodError(result.error) };
 * }
 * ```
 */
export function fromZodError(zodError: ZodError): AppError {
  const firstError = zodError.issues[0];
  const field = firstError.path.join('.');
  const message = firstError.message;

  // Map Zod error codes to our error codes
  let code: string = BaseErrorCode.VALIDATION_INVALID_FORMAT;

  switch (firstError.code) {
    case 'invalid_format':
      // Check if it's an email validation error
      if (message.toLowerCase().includes('email')) {
        code = BaseErrorCode.VALIDATION_INVALID_EMAIL;
      }
      break;
    case 'too_small':
      code = BaseErrorCode.VALIDATION_MIN_LENGTH;
      break;
    case 'too_big':
      code = BaseErrorCode.VALIDATION_MAX_LENGTH;
      break;
    case 'custom':
      // Custom refinements like password mismatch
      code = BaseErrorCode.VALIDATION_MISMATCH;
      break;
  }

  return createError(code, message, { field });
}

/**
 * Check if a value is an AppError
 *
 * @example
 * ```typescript
 * if (isAppError(result)) {
 *   showError(result);
 * }
 * ```
 */
export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value
  );
}
