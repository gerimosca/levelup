/**
 * English error messages
 *
 * Keys are error codes, values are user-friendly messages.
 * Feature-specific messages should be added here when the feature is created.
 */
export const en: Record<string, string> = {
  // Validation errors
  VAL_2001: 'This field is required',
  VAL_2002: 'Please enter a valid email address',
  VAL_2003: 'Invalid format',
  VAL_2004: 'Value is too short',
  VAL_2005: 'Value is too long',
  VAL_2006: 'Values do not match',

  // Database errors
  DB_4001: 'Resource not found',
  DB_4002: 'This item already exists',
  DB_4003: 'Unable to connect to database',
  DB_4004: 'Database operation failed',

  // Generic errors
  ERR_9999: 'An unexpected error occurred',
  ERR_9001: 'Network error. Please check your connection',
  ERR_9002: 'Request timed out. Please try again',

  // Auth errors (AUTH_1xxx)
  AUTH_1001: 'Invalid email or password',
  AUTH_1002: 'User not found',
  AUTH_1003: 'Your session has expired. Please sign in again',
  AUTH_1004: 'You are not authorized to perform this action',
  AUTH_1005: 'An account with this email already exists',
  AUTH_1006: 'Unable to send magic link. Please try again',

  // Billing errors (BILL_3xxx)
  BILL_3001: 'No payment method on file',
  BILL_3002: 'You have reached your usage limit',
  BILL_3003: 'A subscription is required for this feature',
  BILL_3004: 'Payment failed. Please update your payment method',
  BILL_3005: 'Unable to create billing portal session',

  // AI errors (AI_5xxx)
  AI_5001: 'Rate limit exceeded. Please wait a moment',
  AI_5002: 'Input is too long. Please reduce the length',
  AI_5003: 'Content was filtered due to policy restrictions',
  AI_5004: 'AI model is currently unavailable',
  AI_5005: 'Request timed out. Please try again',
  AI_5006: 'Invalid response from AI model',
};
