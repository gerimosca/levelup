import { createClientServer } from '@/shared/database/supabase';
import type { ProfileInput } from './types';

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  input: ProfileInput
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: input.fullName,
      language: input.language,
      timezone: input.timezone,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
