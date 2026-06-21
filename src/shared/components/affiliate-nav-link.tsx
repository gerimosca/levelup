import { getAffiliateProgramSettings } from '@/features/admin/admin.query';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface AffiliateNavLinkProps {
  location: 'header' | 'footer';
  locale: string;
  className?: string;
}

export async function AffiliateNavLink({ location, locale, className }: AffiliateNavLinkProps) {
  // Fetch affiliate settings
  const settings = await getAffiliateProgramSettings();
  const t = await getTranslations('affiliates');

  // Don't render if affiliate program is disabled
  if (!settings?.enabled) {
    return null;
  }

  // Check if should display in this location
  const shouldDisplay = location === 'header'
    ? settings.display_in_header
    : settings.display_in_footer;

  if (!shouldDisplay) {
    return null;
  }

  // Get appropriate link text based on location
  const linkText = location === 'header'
    ? t('nav.header')
    : t('nav.footer');

  return (
    <Link
      href={`/${locale}/affiliates`}
      className={className}
    >
      {linkText}
    </Link>
  );
}