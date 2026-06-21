import type { AttributionData } from './types';

/**
 * Options for attribution capture
 */
interface CaptureOptions {
  /** Include marketing click IDs (gclid, fbclid, etc.) - requires consent */
  includeClickIds?: boolean;
}

/**
 * Capture basic attribution data (always allowed)
 *
 * Includes: UTMs, via, referrer, landing page, device type
 * Does NOT include: gclid, fbclid, fbp (require marketing consent)
 */
export function captureBasicAttribution(): AttributionData {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);

  const attribution: AttributionData = {
    // Custom tracking
    via: urlParams.get('via') || undefined,

    // UTM parameters (always captured for personalization)
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_term: urlParams.get('utm_term') || undefined,
    utm_content: urlParams.get('utm_content') || undefined,

    // Metadata (non-personal)
    referrer: document.referrer || undefined,
    landing_page: window.location.pathname,
    device_type: getDeviceType(),
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  return cleanAttributionData(attribution);
}

/**
 * Capture attribution data from current URL and cookies
 *
 * @param options.includeClickIds - Include gclid/fbclid (requires marketing consent)
 */
export function captureAttribution(
  options: CaptureOptions = {}
): AttributionData {
  const { includeClickIds = true } = options;

  // Start with basic attribution
  const attribution = captureBasicAttribution();

  // Add click IDs only if allowed (marketing consent)
  if (includeClickIds && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);

    // Google Ads
    const gclid = urlParams.get('gclid');
    if (gclid) attribution.gclid = gclid;

    // Meta/Facebook
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      attribution.fbclid = fbclid;
      attribution.fbc = generateFbc(fbclid);
    }
    const fbp = getFbpFromCookie();
    if (fbp) attribution.fbp = fbp;

    // TikTok
    const ttclid = urlParams.get('ttclid');
    if (ttclid) attribution.ttclid = ttclid;
  }

  return cleanAttributionData(attribution);
}

/**
 * Generate Facebook Click ID (fbc) from fbclid
 * Format: fb.{version}.{creation_time}.{fbclid}
 */
export function generateFbc(fbclid: string | null): string | undefined {
  if (!fbclid) return undefined;

  const version = 1;
  const creationTime = Date.now();

  return `fb.${version}.${creationTime}.${fbclid}`;
}

/**
 * Get Facebook Browser ID (fbp) from _fbp cookie
 * This cookie is set by Meta Pixel
 */
export function getFbpFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') {
      return value;
    }
  }

  return undefined;
}

/**
 * Detect device type from user agent
 */
export function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }

  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)
  ) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Remove undefined values from attribution data
 */
export function cleanAttributionData(data: AttributionData): AttributionData {
  const cleaned: AttributionData = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      (cleaned as Record<string, unknown>)[key] = value;
    }
  }

  return cleaned;
}

/**
 * Check if attribution data has any meaningful values
 */
export function hasAttributionData(data: AttributionData): boolean {
  const meaningfulKeys = [
    'via',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'gclid',
    'fbclid',
    'fbc',
  ];

  return meaningfulKeys.some(
    (key) => data[key as keyof AttributionData] !== undefined
  );
}

/**
 * Merge two attribution objects, preferring non-empty values from the second
 */
export function mergeAttribution(
  existing: AttributionData,
  incoming: AttributionData
): AttributionData {
  const merged = { ...existing };

  for (const [key, value] of Object.entries(incoming)) {
    if (value !== undefined && value !== null && value !== '') {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}
