'use client';

import { usePageTracking } from './use-page-tracking';

interface PageTrackerProps {
  userId?: string | null;
}

/**
 * Client component that tracks page views
 * Should be added to layouts to track all pages
 */
export function PageTracker({ userId }: PageTrackerProps) {
  usePageTracking(userId);
  return null; // This component doesn't render anything
}