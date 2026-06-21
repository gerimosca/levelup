'use client';

import { useContext } from 'react';
import { ConsentContext } from '../components/consent-provider';
import type { ConsentContextValue } from '../types';

/**
 * Hook to access consent state and actions
 *
 * Must be used within a ConsentProvider
 *
 * @example
 * ```tsx
 * const { consent, acceptAll, rejectAll } = useConsent();
 *
 * // Check if marketing is allowed
 * if (consent.marketing) {
 *   // Load tracking script
 * }
 *
 * // Accept all cookies
 * <button onClick={acceptAll}>Accept All</button>
 * ```
 */
export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }

  return context;
}
