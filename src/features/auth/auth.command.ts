import { createClientServer } from '@/shared/database/supabase';
import type { AttributionData } from '@/features/attribution';
import type { LoginInput, RegisterInput, MagicLinkInput, ResetPasswordInput, UpdatePasswordInput } from './types';
import type { OAuthProvider } from '@/shared/auth';

/**
 * Sign in with email and password
 */
export async function signInWithPassword(input: LoginInput) {
  const supabase = await createClientServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign up with email and password
 */
export async function signUp(
  input: RegisterInput,
  attributionData?: AttributionData,
  locale?: string
) {
  const supabase = await createClientServer();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        attribution_data: attributionData || {},
        locale: locale || 'en',
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Send magic link to email
 */
export async function signInWithMagicLink(
  input: MagicLinkInput,
  attributionData?: AttributionData,
  locale?: string
) {
  const supabase = await createClientServer();

  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        attribution_data: attributionData || {},
        locale: locale || 'en',
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClientServer();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Sign in with OAuth provider
 * Returns the URL to redirect the user to for OAuth flow
 */
export async function signInWithOAuth(provider: OAuthProvider) {
  const supabase = await createClientServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { url: null, error: error.message };
  }

  return { url: data.url, error: null };
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(input: ResetPasswordInput, locale?: string) {
  const supabase = await createClientServer();

  const userLocale = locale || 'en';
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${userLocale}/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Update user password
 */
export async function updatePassword(input: UpdatePasswordInput) {
  const supabase = await createClientServer();

  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  const supabase = await createClientServer();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
