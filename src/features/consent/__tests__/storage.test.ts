import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveConsent,
  loadConsent,
  clearConsent,
  getConsentState,
  hasConsentChoice,
} from '@/features/consent/lib/storage';
import { consentConfig } from '@/features/consent/consent.config';
import type { ConsentState } from '@/features/consent/types';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('Consent Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('saveConsent', () => {
    it('saves accepted consent to localStorage', () => {
      const consent: ConsentState = { necessary: true, marketing: true };
      saveConsent(consent);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        consentConfig.storageKey,
        expect.any(String)
      );
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        consentConfig.sessionStorageKey
      );

      const saved = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1] as string
      );
      expect(saved.state).toEqual(consent);
      expect(saved.version).toBe(consentConfig.version);
      expect(saved.expiresAt).not.toBeNull();
    });

    it('saves rejected consent to sessionStorage', () => {
      const consent: ConsentState = { necessary: true, marketing: false };
      saveConsent(consent);

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        consentConfig.sessionStorageKey,
        expect.any(String)
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        consentConfig.storageKey
      );

      const saved = JSON.parse(
        sessionStorageMock.setItem.mock.calls[0][1] as string
      );
      expect(saved.state).toEqual(consent);
      expect(saved.expiresAt).toBeNull();
    });
  });

  describe('loadConsent', () => {
    it('loads consent from localStorage', () => {
      const stored = {
        version: consentConfig.version,
        state: { necessary: true, marketing: true },
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

      const loaded = loadConsent();

      expect(loaded).not.toBeNull();
      expect(loaded?.state).toEqual(stored.state);
    });

    it('loads consent from sessionStorage if not in localStorage', () => {
      const stored = {
        version: consentConfig.version,
        state: { necessary: true, marketing: false },
        timestamp: new Date().toISOString(),
        expiresAt: null,
      };
      localStorageMock.getItem.mockReturnValueOnce(null);
      sessionStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

      const loaded = loadConsent();

      expect(loaded).not.toBeNull();
      expect(loaded?.state).toEqual(stored.state);
    });

    it('returns null if version mismatch', () => {
      const stored = {
        version: '0.1', // Old version
        state: { necessary: true, marketing: true },
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

      const loaded = loadConsent();

      expect(loaded).toBeNull();
    });

    it('returns null if expired', () => {
      const stored = {
        version: consentConfig.version,
        state: { necessary: true, marketing: true },
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 86400000).toISOString(), // Expired
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

      const loaded = loadConsent();

      expect(loaded).toBeNull();
    });

    it('returns null if no consent stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      sessionStorageMock.getItem.mockReturnValueOnce(null);

      const loaded = loadConsent();

      expect(loaded).toBeNull();
    });
  });

  describe('clearConsent', () => {
    it('clears both localStorage and sessionStorage', () => {
      clearConsent();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        consentConfig.storageKey
      );
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        consentConfig.sessionStorageKey
      );
    });
  });

  describe('getConsentState', () => {
    it('returns stored state if available', () => {
      const stored = {
        version: consentConfig.version,
        state: { necessary: true, marketing: true },
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

      const state = getConsentState();

      expect(state).toEqual(stored.state);
    });

    it('returns default state if nothing stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      sessionStorageMock.getItem.mockReturnValueOnce(null);

      const state = getConsentState();

      expect(state).toEqual({ necessary: true, marketing: false });
    });
  });

  describe('hasConsentChoice', () => {
    it('returns true if consent is stored', () => {
      const stored = {
        version: consentConfig.version,
        state: { necessary: true, marketing: true },
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored));

      expect(hasConsentChoice()).toBe(true);
    });

    it('returns false if no consent stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      sessionStorageMock.getItem.mockReturnValueOnce(null);

      expect(hasConsentChoice()).toBe(false);
    });
  });
});
