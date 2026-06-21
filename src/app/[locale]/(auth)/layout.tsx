import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { brand } from '@/shared/config/brand';
import { AuthBranding } from '@/features/auth/components/auth-branding';
import { GoogleOneTap } from '@/features/auth/components/google-one-tap';

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('auth');
  const showBranding = brand.auth.showBrandingPanel;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Google One Tap - shows prompt if configured */}
      <GoogleOneTap />

      {/* Branding panel - hidden on mobile */}
      {showBranding && <AuthBranding />}

      {/* Form panel */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile header with logo - hidden on desktop when branding panel is shown */}
        <header className={`p-6 ${showBranding ? 'lg:hidden' : ''}`}>
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image
              src={brand.logo}
              alt={brand.name}
              width={28}
              height={28}
              className="dark:invert"
            />
            <span className="font-semibold">{brand.name}</span>
          </Link>
        </header>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Footer with legal links */}
        <footer className="p-6 text-center">
          <p className="text-xs text-muted-foreground">
            <Link
              href={brand.legal.terms}
              className="hover:text-primary hover:underline"
            >
              {t('termsOfService')}
            </Link>
            {' · '}
            <Link
              href={brand.legal.privacy}
              className="hover:text-primary hover:underline"
            >
              {t('privacyPolicy')}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
