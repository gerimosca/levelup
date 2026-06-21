/**
 * i18n Configuration
 *
 * This file contains only the locale configuration without any dependencies
 * on Node.js APIs, making it safe to import in Edge Runtime (middleware).
 */

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
