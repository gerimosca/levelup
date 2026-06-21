import { getAffiliateProgramSettings } from '@/features/admin/admin.query';
import { getTranslations } from 'next-intl/server';
import { MarketingFooterClient } from './marketing-footer-client';

interface MarketingFooterProps {
  locale: string;
}

export async function MarketingFooter({ locale }: MarketingFooterProps) {
  // Fetch affiliate settings
  const settings = await getAffiliateProgramSettings();
  const t = await getTranslations('affiliates');

  // Check if should display affiliate link in footer
  const showAffiliateLink = settings?.enabled && settings?.display_in_footer;
  const affiliateLinkText = t('nav.footer');

  return (
    <MarketingFooterClient
      locale={locale}
      showAffiliateLink={showAffiliateLink}
      affiliateLinkText={affiliateLinkText}
    />
  );
}