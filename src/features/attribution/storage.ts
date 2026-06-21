import type { AttributionData } from './types';
import {
  captureAttribution,
  captureBasicAttribution,
  mergeAttribution,
  hasAttributionData,
} from './capture';

const STORAGE_KEY = 'attribution_data';

/**
 * Save attribution data to sessionStorage
 * Merges with existing data to preserve first-touch values
 */
export function saveToSession(data: AttributionData): void {
  if (typeof sessionStorage === 'undefined') return;

  try {
    const existing = getFromSession();
    const merged = mergeAttribution(existing, data);

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (error) {
    console.warn('[Attribution] Failed to save to session:', error);
  }
}

/**
 * Get attribution data from sessionStorage
 */
export function getFromSession(): AttributionData {
  if (typeof sessionStorage === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    return JSON.parse(stored) as AttributionData;
  } catch (error) {
    console.warn('[Attribution] Failed to read from session:', error);
    return {};
  }
}

/**
 * Clear attribution data from sessionStorage
 */
export function clearSession(): void {
  if (typeof sessionStorage === 'undefined') return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[Attribution] Failed to clear session:', error);
  }
}

/**
 * Options for attribution capture
 */
interface CaptureOptions {
  /** Include marketing click IDs (requires consent) */
  includeClickIds?: boolean;
}

/**
 * Capture current attribution and save to session
 * Call this on every page load
 *
 * @param options.includeClickIds - Include gclid/fbclid (requires marketing consent)
 */
export function captureAndPersist(options: CaptureOptions = {}): AttributionData {
  const { includeClickIds = true } = options;

  const captured = captureAttribution({ includeClickIds });

  if (hasAttributionData(captured)) {
    saveToSession(captured);
  }

  return getFromSession();
}

/**
 * Get current attribution (from session, capturing fresh if needed)
 * This is the main function to use when you need attribution data
 *
 * @param options.includeClickIds - Include gclid/fbclid when capturing fresh (requires marketing consent)
 */
export function getCurrentAttribution(options: CaptureOptions = {}): AttributionData {
  // First check session
  const stored = getFromSession();

  // If we have stored data, return it
  if (hasAttributionData(stored)) {
    return stored;
  }

  // Otherwise capture fresh
  return captureAndPersist(options);
}

/**
 * Update existing attribution with click IDs
 * Call this when user grants marketing consent after initial capture
 */
export function addClickIdsToAttribution(): void {
  const existing = getFromSession();
  const withClickIds = captureAttribution({ includeClickIds: true });
  const merged = mergeAttribution(existing, withClickIds);
  saveToSession(merged);
}
