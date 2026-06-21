/**
 * Base error codes for shared/generic errors
 *
 * Feature-specific error codes should be defined in each feature's
 * types/errors.ts file to maintain feature isolation.
 *
 * Code ranges:
 * - VAL_2xxx: Validation errors
 * - DB_4xxx: Database errors
 * - ERR_9xxx: Generic/unknown errors
 *
 * Reserved ranges for features:
 * - AUTH_1xxx: Authentication errors
 * - BILL_3xxx: Billing errors
 * - AI_5xxx: AI/ML errors
 */
export enum BaseErrorCode {
  // Validation errors (2xxx)
  VALIDATION_REQUIRED = 'VAL_2001',
  VALIDATION_INVALID_EMAIL = 'VAL_2002',
  VALIDATION_INVALID_FORMAT = 'VAL_2003',
  VALIDATION_MIN_LENGTH = 'VAL_2004',
  VALIDATION_MAX_LENGTH = 'VAL_2005',
  VALIDATION_MISMATCH = 'VAL_2006',

  // Database errors (4xxx)
  DB_NOT_FOUND = 'DB_4001',
  DB_DUPLICATE = 'DB_4002',
  DB_CONNECTION_FAILED = 'DB_4003',
  DB_QUERY_FAILED = 'DB_4004',

  // Generic errors (9xxx)
  UNKNOWN = 'ERR_9999',
  NETWORK_ERROR = 'ERR_9001',
  TIMEOUT = 'ERR_9002',
}
