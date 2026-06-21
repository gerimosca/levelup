import type { TrackingConfig } from './types';

/**
 * Attribution and tracking configuration
 * Reads from environment variables
 */
export const attributionConfig: TrackingConfig = {
  enabled: Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID
  ),

  platforms: {
    google: {
      adsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      conversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL,
      apiToken: process.env.GOOGLE_ADS_API_TOKEN,
    },
    meta: {
      pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
      accessToken: process.env.META_CONVERSIONS_ACCESS_TOKEN,
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

/**
 * Check if a specific platform is configured
 */
export function isPlatformEnabled(platform: 'google' | 'meta'): boolean {
  if (!attributionConfig.enabled) return false;

  switch (platform) {
    case 'google':
      return Boolean(attributionConfig.platforms.google.adsId);
    case 'meta':
      return Boolean(attributionConfig.platforms.meta.pixelId);
    default:
      return false;
  }
}

/**
 * Check if server-side tracking is available for a platform
 */
export function hasServerTracking(platform: 'google' | 'meta'): boolean {
  switch (platform) {
    case 'google':
      return Boolean(attributionConfig.platforms.google.apiToken);
    case 'meta':
      return Boolean(attributionConfig.platforms.meta.accessToken);
    default:
      return false;
  }
}
