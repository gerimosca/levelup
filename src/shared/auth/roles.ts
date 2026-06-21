import { createClientServer } from '@/shared/database/supabase';
import { redirect } from 'next/navigation';
import { getUser } from './session';
import { isEmailWhitelisted } from '@/shared/lib/admin-whitelist';
import type { AuthUser } from './types';

/**
 * Valid user roles stored in profiles.user_flags
 */
export type UserRole = 'admin' | 'super_admin';

/**
 * Check if a specific user has a given role
 * @param userId - User ID to check
 * @param role - Role to verify
 * @returns true if user has the role, false otherwise
 */
export async function userHasRole(
  userId: string,
  role: UserRole
): Promise<boolean> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('profiles')
    .select('user_flags')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  const flags = data.user_flags as string[] | null;
  return flags ? flags.includes(role) : false;
}

/**
 * Check if the current authenticated user has a given role
 * @param role - Role to verify ('admin' | 'super_admin')
 * @returns true if user has the role, false if not authenticated or doesn't have role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getUser();

  if (!user) {
    return false;
  }

  return userHasRole(user.id, role);
}

/**
 * Check if user is an admin (has 'admin' OR 'super_admin' role)
 * Super admins are considered admins for permission checks
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getUser();

  if (!user) {
    return false;
  }

  const hasAdminRole = await userHasRole(user.id, 'admin');
  const hasSuperAdminRole = await userHasRole(user.id, 'super_admin');

  return hasAdminRole || hasSuperAdminRole;
}

/**
 * Check if user is a super admin (has 'super_admin' role specifically)
 * Use this for operations that only super admins should perform
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole('super_admin');
}

/**
 * Sync admin role based on email whitelist
 * If user's email is whitelisted but doesn't have admin flag, adds it
 * If user's email is not whitelisted but has admin flag from whitelist, removes it
 *
 * @param userId - User ID to sync
 * @param userEmail - User email to check against whitelist
 * @returns true if admin flag was added/updated, false otherwise
 */
export async function syncAdminRoleFromWhitelist(
  userId: string,
  userEmail: string
): Promise<boolean> {
  const supabase = await createClientServer();

  // Check if email is whitelisted
  const isWhitelisted = isEmailWhitelisted(userEmail);

  // Get current flags
  const { data, error } = await supabase
    .from('profiles')
    .select('user_flags')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  const currentFlags = (data.user_flags || []) as string[];
  const hasAdminFlag = currentFlags.includes('admin');

  // If whitelisted and doesn't have flag, add it
  if (isWhitelisted && !hasAdminFlag) {
    const newFlags = [...currentFlags, 'admin'];
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        user_flags: newFlags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return !updateError;
  }

  // No changes needed
  return false;
}

/**
 * Require admin role - redirects to dashboard if user is not admin
 * Use in server components/actions that require admin privileges
 *
 * @param locale - Locale for redirect URL
 * @returns AuthUser if user is admin
 * @throws Redirects to dashboard if not admin or not authenticated
 *
 * @example
 * ```ts
 * export default async function AdminPage({ params }) {
 *   const { locale } = await params;
 *   const user = await requireAdmin(locale);
 *   // ... render admin UI
 * }
 * ```
 */
export async function requireAdmin(locale: string = 'en'): Promise<AuthUser> {
  const user = await getUser();

  // Not authenticated -> redirect to login
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Check if user is admin or super admin
  const admin = await isAdmin();

  // Not admin -> redirect to dashboard
  if (!admin) {
    redirect(`/${locale}/dashboard`);
  }

  return user;
}

/**
 * Require super admin role - redirects to dashboard if user is not super admin
 * Use for operations that only super admins should perform
 *
 * @param locale - Locale for redirect URL
 * @returns AuthUser if user is super admin
 * @throws Redirects to dashboard if not super admin or not authenticated
 */
export async function requireSuperAdmin(
  locale: string = 'en'
): Promise<AuthUser> {
  const user = await getUser();

  // Not authenticated -> redirect to login
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Check if user is super admin specifically
  const superAdmin = await isSuperAdmin();

  // Not super admin -> redirect to dashboard
  if (!superAdmin) {
    redirect(`/${locale}/dashboard`);
  }

  return user;
}
