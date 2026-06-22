import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import Script from 'next/script';
import { generateRootMetadata } from '@/shared/lib/metadata';
import { GlobalSchemas } from '@/shared/components/seo/json-ld';
import {
  ConsentProvider,
  ConsentBanner,
  ConsentModal,
  ConsentGate,
} from '@/features/consent/components';
import { getGtagInitScript } from '@/features/consent/lib/gtag';
import { InfoBar } from '@/shared/components/info-bar';
import { CrispProvider } from '@/features/crisp/components';
import { brand } from '@/shared/config/brand';
import type { Locale } from '@/i18n/request';
import './globals.css';

interface MetadataProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  return generateRootMetadata(locale as Locale);
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme={brand.theme.variant} suppressHydrationWarning>
      <head>
        {/* Google Ads / Google Tag with Consent Mode */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            {/* Initialize consent defaults BEFORE loading gtag */}
            <Script id="gtag-consent-init" strategy="beforeInteractive">
              {getGtagInitScript(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID)}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body className="font-sans antialiased">
        <GlobalSchemas />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConsentProvider>
              <InfoBar locale={locale} />
              <CrispProvider locale={locale} />
              {children}

              {/* Meta Pixel - only loads with marketing consent */}
              {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
                <ConsentGate category="marketing">
                  <Script id="meta-pixel" strategy="afterInteractive">
                    {`
                      !function(f,b,e,v,n,t,s)
                      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                      n.queue=[];t=b.createElement(e);t.async=!0;
                      t.src=v;s=b.getElementsByTagName(e)[0];
                      s.parentNode.insertBefore(t,s)}(window, document,'script',
                      'https://connect.facebook.net/en_US/fbevents.js');
                      fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                      fbq('track', 'PageView');
                    `}
                  </Script>
                </ConsentGate>
              )}

              {/* Cookie consent UI */}
              <ConsentBanner />
              <ConsentModal />

              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  classNames: {
                    toast: 'bg-background text-foreground border-border',
                    title: 'font-medium',
                    description: 'text-muted-foreground',
                    success: 'border-green-500/50',
                    error: 'border-destructive/50',
                  },
                }}
              />
            </ConsentProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
