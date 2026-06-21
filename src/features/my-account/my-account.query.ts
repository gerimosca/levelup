import { createClientServer } from '@/shared/database/supabase';
import type { Profile } from './types';

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<{
  profile: Profile | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // If no profile exists, return a default one
    if (error.code === 'PGRST116') {
      return {
        profile: {
          id: userId,
          full_name: null,
          avatar_url: null,
          language: 'en',
          timezone: null,
          user_flags: [],
          current_organization_id: null,
          attribution_data: {},
        },
        error: null,
      };
    }
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
}
