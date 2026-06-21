'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { SkipLink } from '@/shared/components/ui/skip-link';
import { brand } from '@/shared/config';
import { useConsent } from '@/features/consent/hooks/use-consent';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const t = useTranslations('layouts');
  const tConsent = useTranslations('consent');
  const locale = useLocale();
  const { openPreferences, isEnabled } = useConsent();

  return (
    <>
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
      </div>
    </>
  );
}
