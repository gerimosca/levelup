import { createClientServer } from '@/shared/database/supabase';
import type { CrispSettings } from './types';

/**
 * Update Crisp settings in database
 * Only admins can call this (checked in action)
 */
export async function updateCrispSettings(
  userId: string,
  settings: CrispSettings
) {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'crisp_settings',
      value: settings,
      category: 'support',
      description: 'Crisp customer support chat configuration',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('key', 'crisp_settings');

  if (error) {
    console.error('Error updating Crisp settings:', error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}