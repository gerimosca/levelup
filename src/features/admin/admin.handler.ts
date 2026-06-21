import {
  infoBarSettingsSchema,
  emailJourneysSettingsSchema,
  featureFlagsSchema,
  crossSellProductsSettingsSchema,
  affiliateProgramSettingsSchema,
  updateUserFlagsSchema,
  type InfoBarSettings,
  type EmailJourneysSettings,
  type FeatureFlags,
  type CrossSellProductsSettings,
  type AffiliateProgramSettings,
  type ActionResult,
} from './types';
import {
  updateInfoBarSettings,
  updateEmailJourneysSettings,
  updateFeatureFlags,
  updateCrossSellProducts,
  updateAffiliateProgramSettings,
  toggleEmailJourney,
  toggleFeatureFlag,
  updateUserFlags,
  addUserFlag,
  removeUserFlag,
} from './admin.command';

/**
 * ==============================================
 * SETTINGS HANDLERS
 * ==============================================
 */

/**
 * Handle Info Bar settings update with validation
 */
export async function handleUpdateInfoBarSettings(
  userId: string,
  input: unknown
): Promise<ActionResult<InfoBarSettings>> {
  // Validate input
  const validation = infoBarSettingsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: validation.error.issues[0].message,
    };
  }

  // Update settings
  const result = await updateInfoBarSettings(validation.data, userId);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to update info bar settings',
    };
  }

  return {
    success: true,
    data: validation.data,
    error: null,
  };
}

/**
 * Handle Email Journeys settings update with validation
 */
export async function handleUpdateEmailJourneysSettings(
  userId: string,
  input: unknown
): Promise<ActionResult<EmailJourneysSettings>> {
  // Validate input
  const validation = emailJourneysSettingsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: validation.error.issues[0].message,
    };
  }

  // Update settings
  const result = await updateEmailJourneysSettings(validation.data, userId);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to update email journeys settings',
    };
  }

  return {
    success: true,
    data: validation.data,
    error: null,
  };
}

/**
 * Handle Feature Flags update with validation
 */
export async function handleUpdateFeatureFlags(
  userId: string,
  input: unknown
): Promise<ActionResult<FeatureFlags>> {
  // Validate input
  const validation = featureFlagsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: validation.error.issues[0].message,
    };
  }

  // Update settings
  const result = await updateFeatureFlags(validation.data, userId);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to update feature flags',
    };
  }

  return {
    success: true,
    data: validation.data,
    error: null,
  };
}

/**
 * Handle Cross-Sell Products update with validation
 */
export async function handleUpdateCrossSellProducts(
  userId: string,
  input: unknown
): Promise<ActionResult<CrossSellProductsSettings>> {
  // Validate input
  const validation = crossSellProductsSettingsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: validation.error.issues[0].message,
    };
  }

  // Update settings
  const result = await updateCrossSellProducts(validation.data, userId);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to update cross-sell products',
    };
  }

  return {
    success: true,
    data: validation.data,
    error: null,
  };
}

/**
 * Handle Affiliate Program settings update with validation
 */
export async function handleUpdateAffiliateProgramSettings(
  userId: string,
  input: unknown
): Promise<ActionResult<AffiliateProgramSettings>> {
  // Validate input
  const validation = affiliateProgramSettingsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: validation.error.issues[0].message,
    };
  }

  // Update settings
  const result = await updateAffiliateProgramSettings(validation.data, userId);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to update affiliate program settings',
    };
  }

  return {
    success: true,
    data: validation.data,
    error: null,
  };
}

/**
 * Handle toggling email journey
 */
export async function handleToggleEmailJourney(
  userId: string,
  journeyKey: string,
  enabled: boolean
): Promise<ActionResult> {
  const result = await toggleEmailJourney(journeyKey, enabled, userId);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to toggle email journey',
    };
  }

  return {
    success: true,
    data: undefined,
    error: null,
  };
}

/**
 * Handle toggling feature flag
 */
export async function handleToggleFeatureFlag(
  userId: string,
  flagKey: string,
  enabled: boolean
): Promise<ActionResult> {
  const result = await toggleFeatureFlag(flagKey, enabled, userId);

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to toggle feature flag',
    };
  }

  return {
    success: true,
    data: undefined,
    error: null,
  };
}

/**
 * ==============================================
 * USER MANAGEMENT HANDLERS
 * ==============================================
 */

/**
 * Handle updating user flags with validation
 */
export async function handleUpdateUserFlags(
  input: unknown
): Promise<ActionResult> {
  // Validate input
  const validation = updateUserFlagsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      data: null,
      error: validation.error.issues[0].message,
    };
  }

  // Update user flags
  const result = await updateUserFlags(
    validation.data.userId,
    validation.data.flags
  );

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to update user flags',
    };
  }

  return {
    success: true,
    data: undefined,
    error: null,
  };
}

/**
 * Handle making a user admin
 */
export async function handleMakeUserAdmin(
  userId: string
): Promise<ActionResult> {
  const result = await addUserFlag(userId, 'admin');

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to make user admin',
    };
  }

  return {
    success: true,
    data: undefined,
    error: null,
  };
}

/**
 * Handle removing admin from user
 */
export async function handleRemoveUserAdmin(
  userId: string
): Promise<ActionResult> {
  const result = await removeUserFlag(userId, 'admin');

  if (!result.success) {
    return {
      success: false,
      data: null,
      error: result.error || 'Failed to remove admin from user',
    };
  }

  return {
    success: true,
    data: undefined,
    error: null,
  };
}
