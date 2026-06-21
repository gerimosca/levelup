import { en } from './en';
import { es } from './es';

const messages: Record<string, Record<string, string>> = {
  en,
  es,
};

/**
 * Get localized error message by error code
 *
 * Falls back to English if locale not found, then to code if message not found.
 *
 * @example
 * ```typescript
 * const message = getErrorMessage('AUTH_1001', 'es');
 * // Returns: 'Email o contraseña incorrectos'
 * ```
 */
export function getErrorMessage(code: string, locale: string = 'en'): string {
  const localeMessages = messages[locale] || messages.en;
  return localeMessages[code] || messages.en[code] || code;
}

/**
 * Get all messages for a locale
 *
 * Useful for client-side caching of all error messages.
 */
export function getMessages(locale: string = 'en'): Record<string, string> {
  return messages[locale] || messages.en;
}

export { en, es };
