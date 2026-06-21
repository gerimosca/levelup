import { getUser } from '@/shared/auth';
import { getInfoBarSettings } from '@/features/admin/admin.query';
import { InfoBarClient } from './info-bar-client';

interface InfoBarProps {
  locale: string;
}

/**
 * Global Info Bar Component (Server Component)
 *
 * Fetches info bar settings from database and renders conditionally:
 * - Only if enabled
 * - Only if scope matches user auth status
 * - Shows message in current locale
 *
 * Integrates with InfoBarClient for dismiss functionality.
 */
export async function InfoBar({ locale }: InfoBarProps) {
  // Fetch settings and user in parallel
  const [settings, user] = await Promise.all([
    getInfoBarSettings(),
    getUser(),
  ]);

  // Don't render if settings not found or disabled
  if (!settings || !settings.enabled) {
    return null;
  }

  // Check scope and auth status
  const isAuthenticated = !!user;

  // Determine if should show based on scope
  const shouldShow = (() => {
    switch (settings.scope) {
      case 'all':
        return true;
      case 'authenticated':
        return isAuthenticated;
      case 'unauthenticated':
        return !isAuthenticated;
      default:
        return false;
    }
  })();

  if (!shouldShow) {
    return null;
  }

  // Get message for current locale, fallback to English
  const message =
    settings.messages[locale as 'en' | 'es'] || settings.messages.en;

  // Generate unique storage key for this message
  // When message changes, it will show again even if previously dismissed
  const storageKey = `info-bar-dismissed-${settings.mode}-${message.substring(0, 20)}`;

  return (
    <InfoBarClient
      mode={settings.mode}
      message={message}
      dismissible={settings.dismissible}
      storageKey={storageKey}
    />
  );
}
