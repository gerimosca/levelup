/**
 * Attribution data captured from URL parameters and cookies
 */
export type AttributionData = {
  // Custom tracking
  via?: string; // Affiliate/referral code (?via=partner)

  // Standard UTM parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // Google Ads
  gclid?: string; // Google Click ID

  // Meta/Facebook
  fbclid?: string; // Facebook Click ID (raw from URL)
  fbc?: string; // Facebook Click (formatted: fb.1.timestamp.fbclid)
  fbp?: string; // Facebook Browser ID (from _fbp cookie)

  // TikTok (future)
  ttclid?: string;

  // Metadata
  referrer?: string;
  landing_page?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  user_agent?: string;
  timestamp?: string;
};

/**
 * Standard tracking events
 */
export type TrackingEventType =
  | 'signup' // User registered
  | 'login' // User logged in
  | 'page_view' // Page viewed
  | 'view_pricing' // Viewed pricing page
  | 'initiate_checkout' // Started checkout
  | 'purchase'; // Completed purchase

/**
 * Data sent with tracking events
 */
export type TrackingEventData = {
  event_id?: string; // UUID for deduplication
  value?: number; // Monetary value
  currency?: string; // ISO 4217 (USD, EUR)
  email?: string; // For advanced matching (will be hashed)
  user_id?: string; // Internal user ID
  [key: string]: unknown; // Custom properties
};

/**
 * Platform-specific configuration
 */
export type PlatformConfig = {
  google: {
    adsId?: string; // AW-XXXXXXXXX
    conversionLabel?: string;
    apiToken?: string; // For server-side
  };
  meta: {
    pixelId?: string;
    accessToken?: string; // For Conversions API
  };
  tiktok?: {
    pixelId?: string;
    accessToken?: string;
  };
};

/**
 * Tracking configuration
 */
export type TrackingConfig = {
  enabled: boolean;
  platforms: PlatformConfig;
  debug?: boolean;
};

/**
 * Server-side conversion event payload
 */
export type ServerConversionEvent = {
  event_name: string;
  event_id: string;
  event_time: number; // Unix timestamp
  event_source_url: string;
  action_source: 'website';
  user_data: {
    em?: string; // Hashed email
    ph?: string; // Hashed phone
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
    external_id?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    [key: string]: unknown;
  };
  attribution_data?: AttributionData;
};
