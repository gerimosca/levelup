'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getFromSession } from '@/features/attribution';

interface TrackingData {
  path: string;
  userId?: string | null;
  attribution?: any;
  locale?: string;
}

/**
 * Hook to track page views
 * Sends page view data to /api/track endpoint
 * Fire-and-forget approach - doesn't block or show errors
 */
export function usePageTracking(userId?: string | null) {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    // Skip tracking in development if desired
    // if (process.env.NODE_ENV === 'development') return;

    // Skip tracking for API routes or Next.js internals
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return;
    }

    // Get attribution data from session (already captured by attribution system)
    const attribution = getFromSession();

    // Prepare tracking data
    const trackingData: TrackingData = {
      path: pathname,
      userId: userId || null,
      attribution: attribution || null,
      locale,
    };

    // Send tracking request (fire-and-forget)
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    }).catch(() => {
      // Silently ignore errors - tracking should not break the app
      // Could add console.debug for debugging if needed
    });
  }, [pathname, userId, locale]); // Re-run when path or user changes
}

/**
 * Alternative: Manual tracking function for specific events
 */
export async function trackPageView(path: string, userId?: string | null) {
  try {
    const attribution = getFromSession();

    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        userId,
        attribution,
        locale: 'en', // Default, could be passed as parameter
      }),
    });
  } catch {
    // Ignore errors
  }
}