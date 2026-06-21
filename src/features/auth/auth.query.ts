import { createClientServer } from '@/shared/database/supabase';

/**
 * Get the current authenticated user session
 */
export async function getSession() {
  const supabase = await createClientServer();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return { session: null, error: error.message };
  }

  return { session, error: null };
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = await createClientServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user, error: null };
}
