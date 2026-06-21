'use client';

import type { TrackingEventType, TrackingEventData, AttributionData } from './types';
import { attributionConfig, isPlatformEnabled } from './config';
import { getCurrentAttribution } from './storage';

// Extend Window interface for tracking pixels
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Hash email for privacy-safe tracking (SHA-256)
 */
async function hashEmail(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate unique event ID for deduplication
 */
function generateEventId(): string {
  return crypto.randomUUID();
}

/**
 * Map internal event types to Google Ads events
 */
function getGoogleEventName(event: TrackingEventType): string {
  const mapping: Record<TrackingEventType, string> = {
    signup: 'sign_up',
    login: 'login',
    page_view: 'page_view',
    view_pricing: 'view_item',
    initiate_checkout: 'begin_checkout',
    purchase: 'purchase',
  };
  return mapping[event] || event;
}

/**
 * Map internal event types to Meta Pixel events
 */
function getMetaEventName(event: TrackingEventType): string {
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
 * Send event to Google Ads/Analytics
 */
async function sendToGoogle(
  event: TrackingEventType,
  eventId: string,
  data?: TrackingEventData
): Promise<void> {
  if (!isPlatformEnabled('google') || typeof window.gtag !== 'function') {
    return;
  }

  const eventName = getGoogleEventName(event);
  const eventData: Record<string, unknown> = {
    event_id: eventId,
    send_to: attributionConfig.platforms.google.adsId,
  };

  if (data?.value !== undefined) {
    eventData.value = data.value;
    eventData.currency = data.currency || 'USD';
  }

  if (data?.user_id) {
    eventData.user_id = data.user_id;
  }

  window.gtag('event', eventName, eventData);

  if (attributionConfig.debug) {
    console.log('[Attribution] Google event:', eventName, eventData);
  }
}

/**
 * Send event to Meta Pixel
 */
async function sendToMeta(
  event: TrackingEventType,
  eventId: string,
  data?: TrackingEventData,
  attribution?: AttributionData
): Promise<void> {
  if (!isPlatformEnabled('meta') || typeof window.fbq !== 'function') {
    return;
  }

  const eventName = getMetaEventName(event);

  // Event data
  const eventData: Record<string, unknown> = {};

  if (data?.value !== undefined) {
    eventData.value = data.value;
    eventData.currency = data.currency || 'USD';
  }

  // Optional parameters with advanced matching
  const optionalParams: Record<string, unknown> = {
    eventID: eventId,
  };

  // Email hash for advanced matching
  if (data?.email) {
    const emailHash = await hashEmail(data.email);
    optionalParams.em = emailHash;
  }

  // User ID
  if (data?.user_id) {
    optionalParams.external_id = data.user_id;
  }

  // Facebook Click ID (critical for conversion tracking)
  if (attribution?.fbc) {
    optionalParams.fbc = attribution.fbc;
  }

  // Facebook Browser ID
  if (attribution?.fbp) {
    optionalParams.fbp = attribution.fbp;
  }

  // User Agent
  if (attribution?.user_agent) {
    optionalParams.client_user_agent = attribution.user_agent;
  }

  // Send to Meta Pixel
  window.fbq('track', eventName, eventData, optionalParams);

  if (attributionConfig.debug) {
    console.log('[Attribution] Meta event:', eventName, {
      eventData,
      optionalParams,
    });
  }
}

/**
 * Track event on all enabled platforms (client-side)
 * Returns event ID for server-side deduplication
 */
export async function trackEvent(
  event: TrackingEventType,
  data?: TrackingEventData
): Promise<{ eventId: string; attribution: AttributionData }> {
  const eventId = data?.event_id || generateEventId();
  const attribution = getCurrentAttribution();

  // Send to all platforms in parallel
  await Promise.all([
    sendToGoogle(event, eventId, data),
    sendToMeta(event, eventId, data, attribution),
  ]);

  return { eventId, attribution };
}

/**
 * Track signup event
 */
export async function trackSignup(
  email?: string,
  userId?: string
): Promise<{ eventId: string; attribution: AttributionData }> {
  return trackEvent('signup', { email, user_id: userId });
}

/**
 * Track purchase event
 */
export async function trackPurchase(
  value: number,
  currency: string = 'USD',
  email?: string,
  userId?: string
): Promise<{ eventId: string; attribution: AttributionData }> {
  return trackEvent('purchase', {
    value,
    currency,
    email,
    user_id: userId,
  });
}

/**
 * Track page view
 */
export async function trackPageView(): Promise<{
  eventId: string;
  attribution: AttributionData;
}> {
  return trackEvent('page_view');
}

/**
 * Track pricing page view
 */
export async function trackViewPricing(): Promise<{
  eventId: string;
  attribution: AttributionData;
}> {
  return trackEvent('view_pricing');
}

/**
 * Track checkout initiation
 */
export async function trackInitiateCheckout(
  value?: number,
  currency?: string
): Promise<{ eventId: string; attribution: AttributionData }> {
  return trackEvent('initiate_checkout', { value, currency });
}
