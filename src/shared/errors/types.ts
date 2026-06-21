/**
 * Base error types for the application
 *
 * These types provide a standardized way to handle errors across
 * all features while maintaining type safety.
 */

/**
 * Application error structure
 *
 * @example
 * ```typescript
 * const error: AppError = {
 *   code: 'AUTH_1001',
 *   message: 'Invalid credentials',
 *   details: { attempts: 3 }
 * };
 * ```
 */
export type AppError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

/**
 * Result type for operations that can fail
 *
 * Use this instead of throwing errors for predictable failures.
 *
 * @example
 * ```typescript
 * async function getUser(id: string): Promise<Result<User>> {
 *   const user = await db.users.find(id);
 *   if (!user) {
 *     return {
 *       success: false,
 *       error: createError('DB_4001', 'User not found')
 *     };
 *   }
 *   return { success: true, data: user };
 * }
 * ```
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

/**
 * Action state for server actions
 *
 * Simplified version for form actions where you don't need the data back.
 *
 * @example
 * ```typescript
 * export async function loginAction(): Promise<ActionState> {
 *   // ...
 *   return { success: true, message: 'Welcome back!' };
 * }
 * ```
 */
export type ActionState = {
  success: boolean;
  error?: AppError;
  message?: string;
};
