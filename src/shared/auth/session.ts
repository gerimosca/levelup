import { createClientServer } from '@/shared/database/supabase';
import { redirect } from 'next/navigation';
import type { AuthUser } from './types';

/**
 * Map Supabase user to our AuthUser type
 * This is the only place that knows about Supabase User structure
 */
function mapSupabaseUser(supabaseUser: {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: { avatar_url?: string; full_name?: string; name?: string };
}): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    emailVerified: !!supabaseUser.email_confirmed_at,
    avatar: supabaseUser.user_metadata?.avatar_url,
    name:
      supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name,
    raw: supabaseUser,
  };
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return mapSupabaseUser(user);
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use in server components that require authentication
 */
export async function requireUser(locale: string = 'en'): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return user;
}
