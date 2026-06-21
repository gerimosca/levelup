// Types
export type {
  AttributionData,
  TrackingEventType,
  TrackingEventData,
  PlatformConfig,
  TrackingConfig,
  ServerConversionEvent,
} from './types';

// Config
export { attributionConfig, isPlatformEnabled, hasServerTracking } from './config';

// Capture
export {
  captureAttribution,
  generateFbc,
  getFbpFromCookie,
  getDeviceType,
  cleanAttributionData,
  hasAttributionData,
  mergeAttribution,
} from './capture';

// Storage
export {
  saveToSession,
  getFromSession,
  clearSession,
  captureAndPersist,
  getCurrentAttribution,
} from './storage';

// Client-side tracking
export {
  trackEvent,
  trackSignup,
  trackPurchase,
  trackPageView,
  trackViewPricing,
  trackInitiateCheckout,
} from './client';

// Server-side tracking
export {
  sendToMetaAPI,
  sendToGoogleAPI,
  trackServerConversion,
  trackServerPurchase,
  trackServerSignup,
} from './server';
