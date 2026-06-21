/**
 * AuthUser - Provider-agnostic user type
 *
 * This is our own type that abstracts away the auth provider.
 * When migrating to a different auth provider (e.g., Auth.js),
 * only the mapping in session.ts needs to change.
 */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified?: boolean;
  avatar?: string;
  name?: string;
  // Raw provider data for advanced use cases
  raw?: unknown;
}

export type AuthError = {
  message: string;
  status: number;
};

export type OAuthProvider = 'google' | 'apple' | 'facebook' | 'github';
