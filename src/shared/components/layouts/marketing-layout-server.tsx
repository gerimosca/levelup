import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/shared/components/ui/button';
import { SkipLink } from '@/shared/components/ui/skip-link';
import { brand } from '@/shared/config';
import { AffiliateNavLink } from '@/shared/components/affiliate-nav-link';
import { ConsentProvider } from '@/features/consent/components/consent-provider';
import { ConsentBanner } from '@/features/consent/components/consent-banner';
import { ConsentModal } from '@/features/consent/components/consent-modal';
import { MarketingFooter } from './marketing-footer';

interface MarketingLayoutServerProps {
  children: React.ReactNode;
}

export async function MarketingLayoutServer({ children }: MarketingLayoutServerProps) {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  return (
    <ConsentProvider>
      <SkipLink />
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <Link href={`/${locale}`} className="mr-6 flex items-center space-x-2">
                <span className="hidden font-bold sm:inline-block">
                  {brand.name}
                </span>
              </Link>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link
                  href={`/${locale}/pricing`}
                  className="text-foreground/60 transition-colors duration-200 hover:text-foreground"
                >
                  {t('pricing')}
                </Link>
                <Link
                  href={`/${locale}/about`}
                  className="text-foreground/60 transition-colors duration-200 hover:text-foreground"
                >
                  {t('about')}
                </Link>
                {/* Affiliate link in header */}
                <AffiliateNavLink
                  location="header"
                  locale={locale}
                  className="text-foreground/60 transition-colors duration-200 hover:text-foreground"
                />
              </nav>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href={`/${locale}/login`}>{t('login')}</Link>
                </Button>
                <Button asChild>
                  <Link href={`/${locale}/register`}>{t('register')}</Link>
                </Button>
              </nav>
            </div>
          </div>
        </header>
        <main id="main-content" className="flex-1">{children}</main>
        <MarketingFooter locale={locale} />
        <ConsentBanner />
        <ConsentModal />
      </div>
    </ConsentProvider>
  );
}