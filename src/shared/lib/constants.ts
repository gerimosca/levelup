// Application-wide constants

export const APP_NAME = 'AI SaaS Boilerplate';
export const APP_DESCRIPTION = 'Production-ready AI SaaS boilerplate';

export const ROUTES = {
  // Public routes
  HOME: '/',
  PRICING: '/pricing',
  ABOUT: '/about',

  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',

  // Protected routes
  DASHBOARD: '/dashboard',
  MY_ACCOUNT: '/my-account',
  SETTINGS: '/settings',
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
