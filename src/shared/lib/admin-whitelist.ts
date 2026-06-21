/**
 * Admin Email Whitelist
 *
 * Manages the whitelist of admin emails from environment variables.
 * Emails in this whitelist are automatically granted admin privileges.
 *
 * Usage:
 * 1. Set ADMIN_EMAILS in .env.local:
 *    ADMIN_EMAILS=admin@example.com,owner@example.com
 *
 * 2. Check if email is whitelisted:
 *    if (isEmailWhitelisted(userEmail)) { ... }
 */

/**
 * Parse admin emails from environment variable
 * @returns Array of lowercase, trimmed email addresses
 */
function getAdminEmailsFromEnv(): string[] {
  const envEmails = process.env.ADMIN_EMAILS;

  if (!envEmails) {
    return [];
  }

  return envEmails
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0 && email.includes('@'));
}

// Cache the parsed emails
const adminEmails = getAdminEmailsFromEnv();

/**
 * Check if an email is in the admin whitelist
 * @param email - Email address to check
 * @returns true if email is whitelisted as admin
 */
export function isEmailWhitelisted(email: string): boolean {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  return adminEmails.includes(normalizedEmail);
}

/**
 * Get all whitelisted admin emails
 * @returns Array of whitelisted email addresses
 */
export function getWhitelistedEmails(): string[] {
  return [...adminEmails];
}

/**
 * Check if whitelist is configured
 * @returns true if at least one admin email is configured
 */
export function hasWhitelist(): boolean {
  return adminEmails.length > 0;
}

/**
 * Log whitelist status (for debugging in development)
 */
if (process.env.NODE_ENV === 'development') {
  if (adminEmails.length > 0) {
    console.log(`[Admin Whitelist] ${adminEmails.length} admin email(s) configured`);
  } else {
    console.log('[Admin Whitelist] No admin emails configured in ADMIN_EMAILS');
  }
}
