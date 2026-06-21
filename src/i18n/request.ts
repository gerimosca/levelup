import { getRequestConfig } from 'next-intl/server';
import { loadCopiesWithFallback } from './load-copies';
import { locales, defaultLocale, type Locale } from './config';

// Re-export for convenience
export { locales, defaultLocale, type Locale };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Load translations from co-located copies/ files
  // Falls back to legacy messages/*.json during migration
  const messages = await loadCopiesWithFallback(locale as Locale);

  return {
    locale,
    messages,
  };
});
