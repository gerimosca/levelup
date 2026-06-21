import { getUser } from '@/shared/auth';
import { hasActiveSubscription } from '@/features/billing/billing.query';
import { getCrispSettings } from '../crisp.query';
import { CrispChat } from './crisp-chat';

interface CrispProviderProps {
  locale: string;
}

/**
 * Server component that determines if Crisp should be shown
 * based on settings and user authentication status
 */
export async function CrispProvider({ locale }: CrispProviderProps) {
  // Check if Crisp website ID is configured
  if (!process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID) {
    return null;
  }

  // Get Crisp settings from database
  const settings = await getCrispSettings();

  // If Crisp is disabled, don't render
  if (!settings.enabled) {
    return null;
  }

  // Get current user (might be null)
  const user = await getUser();
  const isAuthenticated = !!user;

  // Check scope settings
  const shouldShow = await (async () => {
    switch (settings.scope) {
      case 'all':
        return true;
      case 'authenticated':
        return isAuthenticated;
      case 'unauthenticated':
        return !isAuthenticated;
      case 'subscribers_only':
        if (!isAuthenticated || !user) {
          return false;
        }
        return await hasActiveSubscription(user.id);
      default:
        return false;
    }
  })();

  if (!shouldShow) {
    return null;
  }

  // Prepare user data if authenticated
  const userData = user
    ? {
        email: user.email,
        name: user.name || user.email?.split('@')[0],
        userId: user.id,
      }
    : undefined;

  const effectiveLocale = settings.locale === 'auto' ? locale : settings.locale;

  return (
    <CrispChat
      websiteId={process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID}
      settings={settings}
      userData={userData}
      locale={effectiveLocale}
    />
  );
}