'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { brand } from '@/shared/config';
import { useConsent } from '@/features/consent/hooks/use-consent';

interface MarketingFooterClientProps {
  locale: string;
  showAffiliateLink?: boolean;
  affiliateLinkText?: string;
}

export function MarketingFooterClient({ locale, showAffiliateLink, affiliateLinkText }: MarketingFooterClientProps) {
  const tConsent = useTranslations('consent');
  const { openPreferences, isEnabled } = useConsent();

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          {brand.copyright}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/privacy`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {tConsent('footer.privacy')}
          </Link>
          {showAffiliateLink && (
            <Link
              href={`/${locale}/affiliates`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {affiliateLinkText}
            </Link>
          )}
          {isEnabled && (
            <button
              onClick={openPreferences}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {tConsent('footer.manageCookies')}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}