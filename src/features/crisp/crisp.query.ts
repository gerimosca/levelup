import { createClientServer } from '@/shared/database/supabase';
import type { CrispSettings } from './types';
import { defaultCrispSettings } from './types';

/**
 * Get Crisp settings from database
 * Falls back to default settings if not configured
 */
export async function getCrispSettings(): Promise<CrispSettings> {
  try {
    const supabase = await createClientServer();

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'crisp_settings')
      .single();

    if (error || !data) {
      return defaultCrispSettings;
    }

    return data.value as CrispSettings;
  } catch (error) {
    console.error('Error fetching Crisp settings:', error);
    return defaultCrispSettings;
  }
}