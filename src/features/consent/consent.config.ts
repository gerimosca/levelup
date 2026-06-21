import type { ConsentState } from './types';

/**
 * Consent configuration
 *
 * Customize this file to adjust consent behavior.
 * URLs can be changed to Iubenda or other providers.
 */
export const consentConfig = {
  /**
   * Master switch - disable to skip consent entirely
   * Set NEXT_PUBLIC_CONSENT_ENABLED=false to disable
   */
  enabled: process.env.NEXT_PUBLIC_CONSENT_ENABLED !== 'false',

  /**
   * Consent version - bump to re-request consent
   * Increment when you update your privacy/cookie policy
   */
  version: '1.0',

  /**
   * Expiration in days for accepted consent
   * Rejected consent only lasts for the session
   */
  expirationDays: 365,

  /**
   * Default consent when system is disabled
   * Only used when enabled=false
   */
  defaultConsent: {
    necessary: true,
    marketing: true,
  } as ConsentState,

  /**
   * Policy URLs
   * Automatically uses Iubenda URLs if configured, falls back to local pages
   *
   * To use Iubenda:
   * 1. Generate policies at iubenda.com
   * 2. Add to .env.local:
   *    NEXT_PUBLIC_IUBENDA_PRIVACY_URL=https://...
   *    NEXT_PUBLIC_IUBENDA_COOKIE_URL=https://...
   * 3. URLs will auto-switch to Iubenda content
   */
  policyUrls: {
    privacy: process.env.NEXT_PUBLIC_IUBENDA_PRIVACY_URL || '/privacy',
    cookies: process.env.NEXT_PUBLIC_IUBENDA_COOKIE_URL || '/cookies',
    terms: '/terms', // Always use local Terms (customized for your business)
  },

  /**
   * Category definitions for UI
   */
  categories: {
    necessary: {
      id: 'necessary',
      required: true,
      // Includes: auth, session, UTMs (for personalization), landing page, referrer
    },
    marketing: {
      id: 'marketing',
      required: false,
      // Includes: gclid, fbclid, Meta Pixel, Google Ads identifiers
    },
  },

  /**
   * Google Ads configuration
   */
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,

  /**
   * Meta Pixel configuration
   */
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,

  /**
   * Storage keys
   */
  storageKey: 'cookie-consent',
  sessionStorageKey: 'cookie-consent-session',
} as const;

export type ConsentConfig = typeof consentConfig;
