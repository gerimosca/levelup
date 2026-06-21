import type { ConsentState } from '../types';

/**
 * Google Consent Mode v2 signal types
 */
interface GtagConsentParams {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  wait_for_update?: number;
}

/**
 * Extend Window to include gtag
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Check if gtag is available
 */
export function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Initialize gtag with default denied consent
 *
 * This should be called before loading the gtag script.
 * Sets all consent signals to 'denied' by default.
 */
export function initializeGtagConsent(): void {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];

  // Define gtag function if not exists
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }

  // Set default consent to denied
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500, // Wait 500ms for consent update
  } satisfies GtagConsentParams);
}

/**
 * Update gtag consent based on user choice
 *
 * Maps our consent state to Google Consent Mode signals:
 * - analytics_storage: Always granted (UTMs are necessary for personalization)
 * - ad_storage: Based on marketing consent
 * - ad_user_data: Based on marketing consent
 * - ad_personalization: Based on marketing consent
 */
export function updateGtagConsent(consent: ConsentState): void {
  if (!isGtagAvailable()) return;

  const params: GtagConsentParams = {
    // Analytics always granted (UTMs are necessary)
    analytics_storage: 'granted',
    // Ad-related signals based on marketing consent
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
  };

  window.gtag?.('consent', 'update', params);
}

/**
 * Get script content for initial gtag setup
 *
 * Returns the inline script content that should be placed
 * in the head before loading gtag.js
 */
export function getGtagInitScript(googleAdsId: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    // Set default consent to denied (GDPR compliant)
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'wait_for_update': 500
    });

    gtag('js', new Date());
    gtag('config', '${googleAdsId}');
  `;
}

/**
 * Track a conversion event
 *
 * Only sends if gtag is available. Google will handle
 * conversion modeling if consent is denied.
 */
export function trackConversion(
  conversionId: string,
  conversionLabel: string,
  value?: number,
  currency?: string
): void {
  if (!isGtagAvailable()) return;

  window.gtag?.('event', 'conversion', {
    send_to: `${conversionId}/${conversionLabel}`,
    value,
    currency,
  });
}
