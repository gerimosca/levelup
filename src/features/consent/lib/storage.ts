import { consentConfig } from '../consent.config';
import type { ConsentState, StoredConsent } from '../types';
import { storedConsentSchema, DEFAULT_CONSENT_STATE } from '../types';

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Save consent state to storage
 *
 * - If accepted (marketing=true): localStorage with expiration
 * - If rejected (marketing=false): sessionStorage (dies with session)
 */
export function saveConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;

  const hasAccepted = state.marketing;

  const data: StoredConsent = {
    version: consentConfig.version,
    state,
    timestamp: new Date().toISOString(),
    expiresAt: hasAccepted
      ? addDays(new Date(), consentConfig.expirationDays).toISOString()
      : null,
  };

  try {
    if (hasAccepted) {
      // Persist to localStorage
      localStorage.setItem(consentConfig.storageKey, JSON.stringify(data));
      // Clear session storage if any
      sessionStorage.removeItem(consentConfig.sessionStorageKey);
    } else {
      // Only session storage for rejection
      sessionStorage.setItem(
        consentConfig.sessionStorageKey,
        JSON.stringify(data)
      );
      // Clear localStorage if any
      localStorage.removeItem(consentConfig.storageKey);
    }
  } catch (error) {
    console.error('[Consent] Failed to save consent:', error);
    // Note: Can't import toast here (server-side module)
    // Toast should be shown in the component calling saveConsent
    throw new Error('Failed to save cookie preferences. Please enable cookies in your browser.');
  }
}

/**
 * Load consent state from storage
 *
 * Returns null if:
 * - No consent stored
 * - Version mismatch (policy changed)
 * - Expired
 */
export function loadConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    // First check localStorage (accepted consent)
    const stored = localStorage.getItem(consentConfig.storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      const validated = storedConsentSchema.safeParse(parsed);

      if (validated.success) {
        const data = validated.data;

        // Check version
        if (data.version !== consentConfig.version) {
          clearConsent();
          return null;
        }

        // Check expiration
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          clearConsent();
          return null;
        }

        return data;
      }
    }

    // Then check sessionStorage (rejected consent)
    const sessionStored = sessionStorage.getItem(
      consentConfig.sessionStorageKey
    );
    if (sessionStored) {
      const parsed = JSON.parse(sessionStored);
      const validated = storedConsentSchema.safeParse(parsed);

      if (validated.success) {
        const data = validated.data;

        // Check version
        if (data.version !== consentConfig.version) {
          clearConsent();
          return null;
        }

        return data;
      }
    }

    return null;
  } catch (error) {
    console.warn('[Consent] Failed to load consent:', error);
    return null;
  }
}

/**
 * Clear all consent data
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(consentConfig.storageKey);
    sessionStorage.removeItem(consentConfig.sessionStorageKey);
  } catch (error) {
    console.warn('[Consent] Failed to clear consent:', error);
  }
}

/**
 * Get current consent state
 *
 * Returns stored state or default if none
 */
export function getConsentState(): ConsentState {
  const stored = loadConsent();
  return stored?.state ?? DEFAULT_CONSENT_STATE;
}

/**
 * Check if user has made a consent choice
 */
export function hasConsentChoice(): boolean {
  return loadConsent() !== null;
}

/**
 * Set a simple cookie for server-side access
 * This allows middleware/SSR to check consent status
 */
export function setConsentCookie(state: ConsentState): void {
  if (typeof document === 'undefined') return;

  const value = state.marketing ? 'full' : 'necessary';
  const expires = state.marketing
    ? `; expires=${addDays(new Date(), consentConfig.expirationDays).toUTCString()}`
    : ''; // Session cookie if rejected

  document.cookie = `consent=${value}; path=/; SameSite=Lax${expires}`;
}

/**
 * Get consent status from cookie (for SSR)
 */
export function getConsentFromCookie(): 'full' | 'necessary' | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/consent=(full|necessary)/);
  return match ? (match[1] as 'full' | 'necessary') : null;
}
