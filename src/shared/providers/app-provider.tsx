'use client';

import { createContext, useContext } from 'react';

// Types for app state
export interface AppUser {
  id: string;
  email: string;
  avatar_url?: string;
}

export interface AppSubscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  features: string[];
  current_period_end?: string;
}

export interface AppState {
  user: AppUser | null;
  subscription: AppSubscription | null;
  credits: number;
}

// Context
const AppContext = createContext<AppState | null>(null);

// Provider props
interface AppProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}

// Default state
const defaultState: AppState = {
  user: null,
  subscription: null,
  credits: 0,
};

/**
 * AppProvider - Global state provider for the application
 *
 * Provides AppContext for global state (user, subscription, credits)
 *
 * Usage in layout:
 * ```tsx
 * <AppProvider initialState={{ user, subscription }}>
 *   {children}
 * </AppProvider>
 * ```
 */
export function AppProvider({ children, initialState }: AppProviderProps) {
  const state: AppState = {
    ...defaultState,
    ...initialState,
  };

  return (
    <AppContext.Provider value={state}>{children}</AppContext.Provider>
  );
}

/**
 * useApp - Hook to access global app state
 *
 * Usage:
 * ```tsx
 * const { user, subscription, credits } = useApp();
 *
 * if (subscription?.plan === 'pro') {
 *   // Show pro features
 * }
 * ```
 */
export function useApp(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

/**
 * useSubscription - Hook to access subscription state
 *
 * Usage:
 * ```tsx
 * const subscription = useSubscription();
 * const isPro = subscription?.plan === 'pro';
 * ```
 */
export function useSubscription(): AppSubscription | null {
  const { subscription } = useApp();
  return subscription;
}

/**
 * useCredits - Hook to access credits
 *
 * Usage:
 * ```tsx
 * const credits = useCredits();
 * ```
 */
export function useCredits(): number {
  const { credits } = useApp();
  return credits;
}
