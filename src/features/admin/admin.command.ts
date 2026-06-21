import { createClientServer } from '@/shared/database/supabase';
import type {
  InfoBarSettings,
  EmailJourneysSettings,
  FeatureFlags,
  CrossSellProductsSettings,
  MaintenanceSettings,
  AffiliateProgramSettings,
} from './types';

/**
 * ==============================================
 * APP SETTINGS COMMANDS
 * ==============================================
 */

/**
 * Update a generic setting by key
 */
export async function updateSetting(
  key: string,
  value: Record<string, unknown>,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('app_settings')
    .update({
      value,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key);

  if (error) {
    console.error(`Error updating setting ${key}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to update setting',
    };
  }

  return { success: true, error: null };
}

/**
 * Update Info Bar settings
 */
export async function updateInfoBarSettings(
  settings: InfoBarSettings,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  return updateSetting('info_bar', settings as Record<string, unknown>, userId);
}

/**
 * Update Email Journeys settings
 */
export async function updateEmailJourneysSettings(
  settings: EmailJourneysSettings,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  return updateSetting(
    'email_journeys',
    settings as Record<string, unknown>,
    userId
  );
}

/**
 * Update Feature Flags settings
 */
export async function updateFeatureFlags(
  flags: FeatureFlags,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  return updateSetting(
    'feature_flags',
    flags as Record<string, unknown>,
    userId
  );
}

/**
 * Update Cross-Sell Products settings
 */
export async function updateCrossSellProducts(
  products: CrossSellProductsSettings,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  return updateSetting(
    'cross_sell_products',
    products as Record<string, unknown>,
    userId
  );
}

/**
 * Update Affiliate Program settings
 */
export async function updateAffiliateProgramSettings(
  settings: AffiliateProgramSettings,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  return updateSetting('affiliate_program', settings as Record<string, unknown>, userId);
}

/**
 * Toggle a specific email journey on/off
 */
export async function toggleEmailJourney(
  journeyKey: string,
  enabled: boolean,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // First, get the current email_journeys setting
  const { data: currentData, error: fetchError } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'email_journeys')
    .single();

  if (fetchError || !currentData) {
    return {
      success: false,
      error: 'Failed to fetch email journeys settings',
    };
  }

  // Update the specific journey
  const emailJourneys = currentData.value as EmailJourneysSettings;

  if (!emailJourneys[journeyKey]) {
    return {
      success: false,
      error: `Email journey "${journeyKey}" not found`,
    };
  }

  emailJourneys[journeyKey].enabled = enabled;

  // Update the setting
  return updateEmailJourneysSettings(emailJourneys, userId);
}

/**
 * Toggle a specific feature flag on/off
 */
export async function toggleFeatureFlag(
  flagKey: string,
  enabled: boolean,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // First, get the current feature_flags setting
  const { data: currentData, error: fetchError } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'feature_flags')
    .single();

  if (fetchError || !currentData) {
    return {
      success: false,
      error: 'Failed to fetch feature flags settings',
    };
  }

  // Update the specific flag
  const featureFlags = currentData.value as FeatureFlags;
  featureFlags[flagKey] = enabled;

  // Update the setting
  return updateFeatureFlags(featureFlags, userId);
}

/**
 * ==============================================
 * USER MANAGEMENT COMMANDS
 * ==============================================
 */

/**
 * Update user flags (roles, permissions)
 */
export async function updateUserFlags(
  userId: string,
  flags: string[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('profiles')
    .update({
      user_flags: flags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error(`Error updating user flags for ${userId}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to update user flags',
    };
  }

  return { success: true, error: null };
}

/**
 * Add a flag to a user (e.g., make admin)
 */
export async function addUserFlag(
  userId: string,
  flag: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // First, get current flags
  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('user_flags')
    .eq('id', userId)
    .single();

  if (fetchError || !data) {
    return {
      success: false,
      error: 'Failed to fetch user flags',
    };
  }

  const currentFlags = (data.user_flags || []) as string[];

  // Check if flag already exists
  if (currentFlags.includes(flag)) {
    return { success: true, error: null }; // Already has the flag
  }

  // Add the new flag
  const newFlags = [...currentFlags, flag];

  return updateUserFlags(userId, newFlags);
}

/**
 * Remove a flag from a user (e.g., remove admin)
 */
export async function removeUserFlag(
  userId: string,
  flag: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // First, get current flags
  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('user_flags')
    .eq('id', userId)
    .single();

  if (fetchError || !data) {
    return {
      success: false,
      error: 'Failed to fetch user flags',
    };
  }

  const currentFlags = (data.user_flags || []) as string[];

  // Remove the flag
  const newFlags = currentFlags.filter((f) => f !== flag);

  return updateUserFlags(userId, newFlags);
}
