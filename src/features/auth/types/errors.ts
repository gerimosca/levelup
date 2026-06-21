/**
 * Auth-specific error codes
 *
 * These codes are used by the auth feature handlers and actions.
 * Messages for these codes are defined in /shared/errors/messages/
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH_1001',
  USER_NOT_FOUND = 'AUTH_1002',
  SESSION_EXPIRED = 'AUTH_1003',
  UNAUTHORIZED = 'AUTH_1004',
  EMAIL_EXISTS = 'AUTH_1005',
  MAGIC_LINK_FAILED = 'AUTH_1006',
}
