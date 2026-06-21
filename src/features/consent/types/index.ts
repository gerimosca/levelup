import { z } from 'zod';

/**
 * Consent categories
 * - necessary: Always enabled, cannot be disabled
 * - marketing: Ad tracking (gclid, fbclid, pixels)
 */
export const consentCategorySchema = z.enum(['necessary', 'marketing']);
export type ConsentCategory = z.infer<typeof consentCategorySchema>;

/**
 * Consent state for all categories
 */
export const consentStateSchema = z.object({
  necessary: z.literal(true), // Always true
  marketing: z.boolean(),
});
export type ConsentState = z.infer<typeof consentStateSchema>;

/**
 * Stored consent data (persisted to localStorage)
 */
export const storedConsentSchema = z.object({
  version: z.string(),
  state: consentStateSchema,
  timestamp: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
});
export type StoredConsent = z.infer<typeof storedConsentSchema>;

/**
 * Consent context value
 */
export interface ConsentContextValue {
  /** Current consent state */
  consent: ConsentState;
  /** Whether user has made a consent choice */
  hasConsented: boolean;
  /** Whether to show the banner */
  showBanner: boolean;
  /** Whether consent system is enabled */
  isEnabled: boolean;
  /** Accept all categories */
  acceptAll: () => void;
  /** Reject all optional categories */
  rejectAll: () => void;
  /** Update a specific category */
  updateConsent: (category: ConsentCategory, value: boolean) => void;
  /** Open preferences modal */
  openPreferences: () => void;
  /** Close preferences modal */
  closePreferences: () => void;
  /** Whether preferences modal is open */
  isPreferencesOpen: boolean;
}

/**
 * Default consent state (all denied except necessary)
 */
export const DEFAULT_CONSENT_STATE: ConsentState = {
  necessary: true,
  marketing: false,
};

/**
 * Full consent state (all accepted)
 */
export const FULL_CONSENT_STATE: ConsentState = {
  necessary: true,
  marketing: true,
};
