import type {
  AttributionData,
  ServerConversionEvent,
  TrackingEventType,
} from './types';
import { attributionConfig, hasServerTracking } from './config';

/**
 * Hash value for privacy (SHA-256)
 */
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Map internal event types to Meta Conversions API events
 */
function getMetaServerEventName(event: TrackingEventType): string {
  const mapping: Record<TrackingEventType, string> = {
    signup: 'CompleteRegistration',
    login: 'Lead',
    page_view: 'PageView',
    view_pricing: 'ViewContent',
    initiate_checkout: 'InitiateCheckout',
    purchase: 'Purchase',
  };
  return mapping[event] || event;
}

/**
 * Send conversion event to Meta Conversions API
 * https://developers.facebook.com/docs/marketing-api/conversions-api
 */
export async function sendToMetaAPI(
  event: TrackingEventType,
  eventId: string,
  attribution: AttributionData,
  customData?: {
    value?: number;
    currency?: string;
    email?: string;
    phone?: string;
    userId?: string;
  }
): Promise<boolean> {
  if (!hasServerTracking('meta')) {
    if (attributionConfig.debug) {
      console.log('[Attribution] Meta Conversions API not configured');
    }
    return false;
  }

  const pixelId = attributionConfig.platforms.meta.pixelId;
  const accessToken = attributionConfig.platforms.meta.accessToken;

  if (!pixelId || !accessToken) {
    return false;
  }

  try {
    // Build user_data with hashed PII
    const userData: ServerConversionEvent['user_data'] = {
      client_user_agent: attribution.user_agent,
      fbc: attribution.fbc,
      fbp: attribution.fbp,
    };

    if (customData?.email) {
      userData.em = await hashValue(customData.email);
    }

    if (customData?.phone) {
      userData.ph = await hashValue(customData.phone);
    }

    if (customData?.userId) {
      userData.external_id = customData.userId;
    }

    // Build event payload
    const eventPayload: ServerConversionEvent = {
      event_name: getMetaServerEventName(event),
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: attribution.landing_page || '',
      action_source: 'website',
      user_data: userData,
      custom_data: {
        value: customData?.value,
        currency: customData?.currency || 'USD',
      },
      attribution_data: attribution,
    };

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [eventPayload],
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[Attribution] Meta API error:', error);
      return false;
    }

    if (attributionConfig.debug) {
      console.log('[Attribution] Meta API success:', eventPayload.event_name);
    }

    return true;
  } catch (error) {
    console.error('[Attribution] Meta API error:', error);
    return false;
  }
}

/**
 * Send conversion event to Google Ads API
 * https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
 */
export async function sendToGoogleAPI(
  event: TrackingEventType,
  eventId: string,
  attribution: AttributionData,
  customData?: {
    value?: number;
    currency?: string;
    email?: string;
    userId?: string;
  }
): Promise<boolean> {
  if (!hasServerTracking('google')) {
    if (attributionConfig.debug) {
      console.log('[Attribution] Google Ads API not configured');
    }
    return false;
  }

  const { adsId, conversionLabel, apiToken } = attributionConfig.platforms.google;

  if (!adsId || !apiToken) {
    return false;
  }

  try {
    // Google Ads API requires gclid for click-based conversions
    if (!attribution.gclid) {
      if (attributionConfig.debug) {
        console.log('[Attribution] No gclid for Google conversion');
      }
      return false;
    }

    // Build conversion payload
    const conversionPayload = {
      conversionAction: `customers/${adsId.replace('AW-', '')}/conversionActions/${conversionLabel}`,
      gclid: attribution.gclid,
      conversionDateTime: new Date().toISOString(),
      conversionValue: customData?.value,
      currencyCode: customData?.currency || 'USD',
      orderId: eventId,
    };

    // Note: Full Google Ads API implementation requires OAuth2
    // This is a simplified version - production should use google-ads-api library
    if (attributionConfig.debug) {
      console.log('[Attribution] Google conversion prepared:', conversionPayload);
    }

    // TODO: Implement full Google Ads API call
    // For now, log the payload for debugging
    console.log('[Attribution] Google Ads API payload:', conversionPayload);

    return true;
  } catch (error) {
    console.error('[Attribution] Google API error:', error);
    return false;
  }
}

/**
 * Options for server-side conversion tracking
 */
interface TrackingOptions {
  /** Whether user has marketing consent. Required for Meta API. */
  hasMarketingConsent?: boolean;
}

/**
 * Send server-side conversion to all configured platforms
 *
 * @param options.hasMarketingConsent - Required for Meta API, Google uses Consent Mode
 */
export async function trackServerConversion(
  event: TrackingEventType,
  eventId: string,
  attribution: AttributionData,
  customData?: {
    value?: number;
    currency?: string;
    email?: string;
    phone?: string;
    userId?: string;
  },
  options: TrackingOptions = {}
): Promise<{ meta: boolean; google: boolean }> {
  const { hasMarketingConsent = false } = options;

  // Google - always send (they handle Consent Mode modeling)
  const googleResult = sendToGoogleAPI(event, eventId, attribution, customData);

  // Meta - only send with marketing consent
  let metaResult: Promise<boolean>;
  if (hasMarketingConsent) {
    metaResult = sendToMetaAPI(event, eventId, attribution, customData);
  } else {
    if (attributionConfig.debug) {
      console.log('[Attribution] Skipping Meta API - no marketing consent');
    }
    metaResult = Promise.resolve(false);
  }

  const results = await Promise.all([metaResult, googleResult]);

  return {
    meta: results[0],
    google: results[1],
  };
}

/**
 * Track server-side purchase conversion
 * Call this from Stripe webhook after successful payment
 *
 * @param hasMarketingConsent - Whether user consented to marketing tracking
 */
export async function trackServerPurchase(
  eventId: string,
  attribution: AttributionData,
  value: number,
  currency: string,
  email?: string,
  userId?: string,
  hasMarketingConsent?: boolean
): Promise<{ meta: boolean; google: boolean }> {
  return trackServerConversion(
    'purchase',
    eventId,
    attribution,
    {
      value,
      currency,
      email,
      userId,
    },
    { hasMarketingConsent }
  );
}

/**
 * Track server-side signup conversion
 * Call this after successful registration
 *
 * @param hasMarketingConsent - Whether user consented to marketing tracking
 */
export async function trackServerSignup(
  eventId: string,
  attribution: AttributionData,
  email?: string,
  userId?: string,
  hasMarketingConsent?: boolean
): Promise<{ meta: boolean; google: boolean }> {
  return trackServerConversion(
    'signup',
    eventId,
    attribution,
    {
      email,
      userId,
    },
    { hasMarketingConsent }
  );
}
