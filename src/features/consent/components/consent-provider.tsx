'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { consentConfig } from '../consent.config';
import {
  saveConsent,
  loadConsent,
  setConsentCookie,
  hasConsentChoice,
} from '../lib/storage';
import { updateGtagConsent } from '../lib/gtag';
import type { ConsentContextValue, ConsentState, ConsentCategory } from '../types';
import { DEFAULT_CONSENT_STATE, FULL_CONSENT_STATE } from '../types';

export const ConsentContext = createContext<ConsentContextValue | null>(null);

interface ConsentProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for cookie consent management
 *
 * Wrap your app with this provider to enable consent management.
 * If consent is disabled via config, it provides default full consent.
 */
export function ConsentProvider({ children }: ConsentProviderProps) {
  // State
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT_STATE);
  const [hasConsented, setHasConsented] = useState(false); // Start false until we load from storage
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if consent system is enabled
  const isEnabled = consentConfig.enabled;

  // Initialize from storage on mount
  useEffect(() => {
    if (!isEnabled) {
      // If disabled, use default full consent
      setConsent(consentConfig.defaultConsent);
      setHasConsented(true);
      setIsInitialized(true);
      return;
    }

    // Load from storage
    const stored = loadConsent();
    if (stored) {
      setConsent(stored.state);
      setHasConsented(true);
    } else {
      setConsent(DEFAULT_CONSENT_STATE);
      setHasConsented(false);
    }

    setIsInitialized(true);
  }, [isEnabled]);

  // Update gtag when consent changes (after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    updateGtagConsent(consent);
    setConsentCookie(consent);
  }, [consent, isInitialized]);

  // Actions
  const acceptAll = useCallback(() => {
    const newState = FULL_CONSENT_STATE;
    try {
      setConsent(newState);
      setHasConsented(true);
      saveConsent(newState);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    }
  }, []);

  const rejectAll = useCallback(() => {
    const newState = DEFAULT_CONSENT_STATE;
    try {
      setConsent(newState);
      setHasConsented(true);
      saveConsent(newState);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    }
  }, []);

  const updateConsent = useCallback(
    (category: ConsentCategory, value: boolean) => {
      // Can't disable necessary
      if (category === 'necessary') return;

      try {
        setConsent((prev) => {
          const newState = { ...prev, [category]: value };
          saveConsent(newState);
          return newState;
        });
        setHasConsented(true);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
      }
    },
    []
  );

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  // Show banner only if enabled and user hasn't consented
  const showBanner = isEnabled && isInitialized && !hasConsented;

  // Context value
  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasConsented,
      showBanner,
      isEnabled,
      acceptAll,
      rejectAll,
      updateConsent,
      openPreferences,
      closePreferences,
      isPreferencesOpen,
    }),
    [
      consent,
      hasConsented,
      showBanner,
      isEnabled,
      acceptAll,
      rejectAll,
      updateConsent,
      openPreferences,
      closePreferences,
      isPreferencesOpen,
    ]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}
