'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { useConsent } from '../hooks/use-consent';
import { consentConfig } from '../consent.config';

/**
 * Cookie consent banner
 *
 * Displays at the bottom of the screen when user hasn't made a consent choice.
 * Provides options to accept all, reject all, or customize preferences.
 */
export function ConsentBanner() {
  const t = useTranslations('consent');
  const { showBanner, acceptAll, rejectAll, openPreferences } = useConsent();

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label={t('banner.title')}
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-description"
      className="fixed bottom-0 left-0 right-0 z-[45] border-t bg-background p-4 shadow-lg md:p-6"
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h2
              id="consent-banner-title"
              className="text-base font-semibold md:text-lg"
            >
              {t('banner.title')}
            </h2>
            <p
              id="consent-banner-description"
              className="mt-1 text-sm text-muted-foreground"
            >
              {t('banner.description')}{' '}
              <a
                href={consentConfig.policyUrls.cookies}
                className="underline hover:text-foreground"
              >
                {t('banner.learnMore')}
              </a>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button size="sm" onClick={acceptAll}>
              {t('banner.acceptAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openPreferences}
            >
              {t('banner.customize')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
