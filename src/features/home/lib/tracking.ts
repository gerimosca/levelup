/**
 * Home Page Tracking Library
 * Prepared for future A/B testing and analytics
 * Currently logs to console in development
 * Future: Will send to database/analytics service
 */

interface TrackingEvent {
  sectionKey: string;
  variant: string;
  eventType: 'impression' | 'click' | 'conversion' | 'interaction';
  element?: string;
  value?: any;
  timestamp: string;
  sessionId?: string;
  userId?: string;
}

// Get or create session ID (for anonymous tracking)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('tracking_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('tracking_session_id', sessionId);
  }
  return sessionId;
}

// Log event in development
function logEvent(event: TrackingEvent) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Tracking]', event);
  }
}

/**
 * Track section impression
 * Called when a section becomes visible
 */
export async function trackImpression(
  sectionKey: string,
  variant: string = 'A'
): Promise<void> {
  const event: TrackingEvent = {
    sectionKey,
    variant,
    eventType: 'impression',
    timestamp: new Date().toISOString(),
    sessionId: getSessionId()
  };

  logEvent(event);

  // TODO: Future implementation
  // await fetch('/api/tracking/impression', {
  //   method: 'POST',
  //   body: JSON.stringify(event)
  // });
}

/**
 * Track click on element
 * Called when user clicks on interactive elements
 */
export async function trackClick(
  sectionKey: string,
  element: string,
  variant: string = 'A',
  value?: any
): Promise<void> {
  const event: TrackingEvent = {
    sectionKey,
    variant,
    eventType: 'click',
    element,
    value,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId()
  };

  logEvent(event);

  // TODO: Future implementation
  // await fetch('/api/tracking/click', {
  //   method: 'POST',
  //   body: JSON.stringify(event)
  // });
}

/**
 * Track conversion
 * Called when user completes a desired action
 */
export async function trackConversion(
  conversionType: 'signup' | 'trial_start' | 'demo_request' | 'purchase',
  sectionKey?: string,
  variant: string = 'A'
): Promise<void> {
  const event: TrackingEvent = {
    sectionKey: sectionKey || 'global',
    variant,
    eventType: 'conversion',
    element: conversionType,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId()
  };

  logEvent(event);

  // Mark session as converted
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`converted_${conversionType}`, 'true');
  }

  // TODO: Future implementation
  // await fetch('/api/tracking/conversion', {
  //   method: 'POST',
  //   body: JSON.stringify(event)
  // });
}

/**
 * Track generic interaction
 * For custom events like video play, form focus, etc.
 */
export async function trackInteraction(
  sectionKey: string,
  action: string,
  variant: string = 'A',
  metadata?: any
): Promise<void> {
  const event: TrackingEvent = {
    sectionKey,
    variant,
    eventType: 'interaction',
    element: action,
    value: metadata,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId()
  };

  logEvent(event);

  // TODO: Future implementation
  // await fetch('/api/tracking/interaction', {
  //   method: 'POST',
  //   body: JSON.stringify(event)
  // });
}

/**
 * Get A/B test assignment for a section
 * Future: Will fetch from cookie/database
 */
export function getVariantAssignment(
  sectionKey: string,
  defaultVariant: 'A' | 'B' = 'A'
): 'A' | 'B' {
  if (typeof window === 'undefined') return defaultVariant;

  // TODO: Future - read from cookie set by middleware
  // const assignments = getCookie('ab_variants');
  // return assignments[sectionKey] || defaultVariant;

  // For now, always return default
  return defaultVariant;
}

/**
 * Check if user has already converted
 * Useful for hiding CTAs after conversion
 */
export function hasConverted(conversionType: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(`converted_${conversionType}`) === 'true';
}

/**
 * Initialize tracking for page view
 * Call this once when page loads
 */
export function initializeTracking(userId?: string): void {
  if (typeof window === 'undefined') return;

  // Set user ID if provided
  if (userId) {
    sessionStorage.setItem('tracking_user_id', userId);
  }

  // Track page view
  logEvent({
    sectionKey: 'page',
    variant: 'A',
    eventType: 'impression',
    element: window.location.pathname,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    userId
  });

  // TODO: Future - send initial tracking beacon
}