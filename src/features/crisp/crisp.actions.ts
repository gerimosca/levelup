'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/shared/auth';
import { updateCrispSettings } from './crisp.command';
import { crispSettingsSchema, type CrispSettings } from './types';
import type { ActionResult } from '@/shared/types/common';

/**
 * Server action to update Crisp settings
 * Only admins can update these settings
 */
export async function updateCrispSettingsAction(
  settings: CrispSettings
): Promise<ActionResult> {
  try {
    const user = await requireAdmin();

    // Validate input
    const validation = crispSettingsSchema.safeParse(settings);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const result = await updateCrispSettings(user.id, validation.data);

    if (result.success) {
      // Revalidate all pages since Crisp can appear anywhere
      revalidatePath('/', 'layout');
    }

    if (result.success) {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to update settings',
      };
    }
  } catch (error) {
    console.error('Error in updateCrispSettingsAction:', error);
    return {
      success: false,
      error: 'Failed to update Crisp settings',
    };
  }
}