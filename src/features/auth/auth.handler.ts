import { createError, fromZodError } from '@/shared/errors';
import type { AttributionData } from '@/features/attribution';
import { syncAdminRoleFromWhitelist } from '@/shared/auth/roles';

import {
  signInWithMagicLink,
  signInWithPassword,
  signOut,
  signUp,
  requestPasswordReset,
  updatePassword,
  resendVerificationEmail,
} from './auth.command';
import {
  AuthErrorCode,
  loginSchema,
  magicLinkSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from './types';
import type { AuthState } from './types';

/**
 * Handle login with email/password
 */
export async function handleLogin(
  email: string,
  password: string
): Promise<AuthState> {
  const validationResult = loginSchema.safeParse({ email, password });

  if (!validationResult.success) {
    return {
      success: false,
      error: fromZodError(validationResult.error),
    };
  }

  const { user, error } = await signInWithPassword(validationResult.data);

  if (error) {
    return {
      success: false,
      error: createError(AuthErrorCode.INVALID_CREDENTIALS, error),
    };
  }

  // Sync admin role from whitelist on successful login
  if (user?.email) {
    await syncAdminRoleFromWhitelist(user.id, user.email);
  }

  return {
    success: true,
    messageKey: 'welcomeBack',
  };
}

/**
 * Handle registration
 */
export async function handleRegister(
  email: string,
  password: string,
  attributionData?: AttributionData,
  locale?: string
): Promise<AuthState> {
  const validationResult = registerSchema.safeParse({
    email,
    password,
  });

  if (!validationResult.success) {
    return {
      success: false,
      error: fromZodError(validationResult.error),
    };
  }

  const { user, error } = await signUp(validationResult.data, attributionData, locale);

  if (error) {
    // Check if it's a duplicate email error
    const errorCode = error.includes('already')
      ? AuthErrorCode.EMAIL_EXISTS
      : AuthErrorCode.INVALID_CREDENTIALS;

    return {
      success: false,
      error: createError(errorCode, error),
    };
  }

  // Sync admin role from whitelist for new registrations
  if (user?.email) {
    await syncAdminRoleFromWhitelist(user.id, user.email);
  }

  return {
    success: true,
    messageKey: 'checkEmailVerification',
  };
}

/**
 * Handle magic link request
 */
export async function handleMagicLink(
  email: string,
  attributionData?: AttributionData,
  locale?: string
): Promise<AuthState> {
  const validationResult = magicLinkSchema.safeParse({ email });

  if (!validationResult.success) {
    return {
      success: false,
      error: fromZodError(validationResult.error),
    };
  }

  const { success, error } = await signInWithMagicLink(
    validationResult.data,
    attributionData,
    locale
  );

  if (error) {
    return {
      success: false,
      error: createError(AuthErrorCode.MAGIC_LINK_FAILED, error),
    };
  }

  return {
    success,
    messageKey: 'checkEmail',
  };
}

/**
 * Handle logout
 */
export async function handleLogout(): Promise<AuthState> {
  const { success, error } = await signOut();

  if (error) {
    return {
      success: false,
      error: createError(AuthErrorCode.SESSION_EXPIRED, error),
    };
  }

  return {
    success,
    messageKey: 'loggedOut',
  };
}

/**
 * Handle password reset request
 */
export async function handleResetPassword(email: string, locale?: string): Promise<AuthState> {
  const validationResult = resetPasswordSchema.safeParse({ email });

  if (!validationResult.success) {
    return {
      success: false,
      error: fromZodError(validationResult.error),
    };
  }

  const { success, error } = await requestPasswordReset(validationResult.data, locale);

  if (error) {
    return {
      success: false,
      error: createError(AuthErrorCode.INVALID_CREDENTIALS, error),
    };
  }

  return {
    success,
    messageKey: 'resetPasswordSuccess',
  };
}

/**
 * Handle password update
 */
export async function handleUpdatePassword(
  password: string,
  confirmPassword: string
): Promise<AuthState> {
  const validationResult = updatePasswordSchema.safeParse({
    password,
    confirmPassword,
  });

  if (!validationResult.success) {
    return {
      success: false,
      error: fromZodError(validationResult.error),
    };
  }

  const { success, error } = await updatePassword(validationResult.data);

  if (error) {
    return {
      success: false,
      error: createError(AuthErrorCode.INVALID_CREDENTIALS, error),
    };
  }

  return {
    success,
    messageKey: 'passwordUpdated',
  };
}

/**
 * Handle resend verification email
 */
export async function handleResendVerification(email: string): Promise<AuthState> {
  const { success, error } = await resendVerificationEmail(email);

  if (error) {
    return {
      success: false,
      error: createError(AuthErrorCode.MAGIC_LINK_FAILED, error),
    };
  }

  return {
    success,
    messageKey: 'emailResent',
  };
}
