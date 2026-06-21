'use client';

import { useCallback } from 'react';

export type LoginMethod = 'email' | 'magic_link' | 'google' | 'github' | 'apple';

const STORAGE_KEY = 'last_login_method';

/**
 * Hook to manage the last used login method
 * Persists to localStorage to help users quickly access their preferred method
 */
export function useLastLoginMethod() {
  const getLastMethod = useCallback((): LoginMethod | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored as LoginMethod | null;
    } catch {
      return null;
    }
  }, []);

  const setLastMethod = useCallback((method: LoginMethod) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, method);
    } catch {
      // localStorage might be unavailable (private browsing, etc.)
    }
  }, []);

  const clearLastMethod = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    getLastMethod,
    setLastMethod,
    clearLastMethod,
  };
}
