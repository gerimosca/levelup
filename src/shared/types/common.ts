/**
 * Common types shared across the application
 */

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
