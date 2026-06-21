/**
 * Error Handler Utility
 *
 * Provides consistent error handling across all i18n scripts.
 * Displays user-friendly error messages with helpful context.
 */

/**
 * Handle and display an error in a user-friendly way
 *
 * @param {Object|Error} error - Error object with code and message
 */
export function handleError(error) {
  console.error('\n❌ Error occurred:\n');

  if (error.message) {
    console.error(error.message);
  } else {
    console.error('An unexpected error occurred:', error);
  }

  if (error.stack && process.env.DEBUG) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }

  console.error('');
}

/**
 * Create a validation error
 *
 * @param {string} message - Error message
 * @param {number} code - Exit code (default: 1)
 * @returns {Object} Error object
 */
export function createValidationError(message, code = 1) {
  return {
    code,
    message: `Error: ${message}`
  };
}

/**
 * Create a file error
 *
 * @param {string} operation - Operation attempted (read, write, etc.)
 * @param {string} filePath - File path
 * @param {string} details - Additional error details
 * @param {number} code - Exit code (default: 3)
 * @returns {Object} Error object
 */
export function createFileError(operation, filePath, details, code = 3) {
  return {
    code,
    message: `Error: Could not ${operation} file: ${filePath}\n\n${details}`
  };
}

/**
 * Create an API error
 *
 * @param {string} details - Error details
 * @param {number} code - Exit code (default: 4)
 * @returns {Object} Error object
 */
export function createAPIError(details, code = 4) {
  return {
    code,
    message: `Error: API call failed\n\n${details}`
  };
}
