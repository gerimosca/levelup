import type { Locale } from './config';

/**
 * Merged translations object
 * Structure: { namespace: { key: value } }
 */
export type Messages = Record<string, Record<string, any>>;

/**
 * Load pre-generated static translations
 *
 * This function loads translations from pre-generated static files
 * (created at build time by scripts/i18n/generators/generate-static-translations.mjs).
 *
 * Why static files?
 * - Performance: <1ms per request (vs ~50-100ms reading 32 files from disk)
 * - Build-time validation: If translations are missing, build fails
 * - Serverless-friendly: Files are bundled in deployment
 * - Same behavior in dev and prod
 *
 * To regenerate static files:
 *   npm run i18n:generate-static
 *
 * @param locale - The locale to load ('en' | 'es')
 * @returns Merged translations object
 *
 * @example
 * const messages = await loadCopies('en');
 * // {
 * //   auth: { title: "Sign In", ... },
 * //   billing: { title: "Billing", ... },
 * //   ui: { button: { submit: "Submit" } },
 * //   ...
 * // }
 */
export async function loadCopies(locale: Locale): Promise<Messages> {
  try {
    // Import pre-generated static file
    // These files are created by: npm run i18n:generate-static
    const imported = await import(`./generated/${locale}.json`);
    const messages = imported.default || imported;

    if (process.env.NODE_ENV === 'development') {
      const namespaceCount = Object.keys(messages).length;
      console.log(
        `[i18n] Loaded ${namespaceCount} namespaces for locale "${locale}" from static file`
      );
    }

    return messages;
  } catch (error) {
    console.error(
      `[i18n] Failed to load static translations for locale "${locale}".\n` +
      `Make sure you've run: npm run i18n:generate-static\n`,
      error
    );
    throw new Error(
      `Missing static translation file: src/i18n/generated/${locale}.json. ` +
      `Run: npm run i18n:generate-static`
    );
  }
}

/**
 * Load copies with fallback to legacy messages
 *
 * Alias for loadCopies() - kept for backward compatibility during migration.
 * Now that migration is complete, this just calls loadCopies().
 *
 * @param locale - The locale to load
 * @returns Merged translations from copies/ files
 */
export async function loadCopiesWithFallback(locale: Locale): Promise<Messages> {
  return loadCopies(locale);
}
