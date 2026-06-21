import type { Metadata } from 'next';
import { brand } from '@/shared/config/brand';
import { locales, type Locale } from '@/i18n/request';

/**
 * Options for generating page metadata
 */
export interface PageMetadataOptions {
  /** Page title (will be formatted with titleTemplate) */
  title: string;

  /** Page description (max 160 characters recommended) */
  description: string;

  /** Current locale */
  locale: Locale;

  /** Current path without locale prefix (e.g., '/pricing') */
  path?: string;

  /** Custom Open Graph image (defaults to brand.seo.ogImage) */
  ogImage?: string;

  /** Page type for Open Graph */
  ogType?: 'website' | 'article';

  /** Additional keywords for this page */
  keywords?: string[];

  /** Prevent indexing of this page */
  noIndex?: boolean;

  /** Prevent following links on this page */
  noFollow?: boolean;
}

/**
 * Generates comprehensive metadata for a page including:
 * - Basic meta tags (title, description)
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URL
 * - hreflang alternates for i18n
 * - Robots directives
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const { locale } = await params;
 *   const t = await getTranslations({ locale, namespace: 'seo' });
 *
 *   return generatePageMetadata({
 *     title: t('pricing.title'),
 *     description: t('pricing.description'),
 *     locale,
 *     path: '/pricing',
 *   });
 * }
 * ```
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    locale,
    path = '',
    ogImage = brand.seo.ogImage,
    ogType = 'website',
    keywords = [],
    noIndex = false,
    noFollow = false,
  } = options;

  // Build full URLs
  const baseUrl = brand.website.replace(/\/$/, '');
  const canonicalPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${baseUrl}/${locale}${canonicalPath}`;
  const ogImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `${baseUrl}${ogImage}`;

  // Build alternate language URLs
  const alternateLanguages: Record<string, string> = {};
  for (const loc of locales) {
    alternateLanguages[loc] = `${baseUrl}/${loc}${canonicalPath}`;
  }

  // Combine keywords
  const allKeywords = [...brand.seo.keywords, ...keywords];

  // Build robots directives
  const robotsDirectives: string[] = [];
  if (noIndex) robotsDirectives.push('noindex');
  if (noFollow) robotsDirectives.push('nofollow');
  const robotsContent =
    robotsDirectives.length > 0 ? robotsDirectives.join(', ') : 'index, follow';

  return {
    title: {
      default: title,
      template: brand.seo.titleTemplate,
    },
    description,
    keywords: allKeywords,

    // Canonical and alternates
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...alternateLanguages,
        'x-default': `${baseUrl}/en${canonicalPath}`,
      },
    },

    // Open Graph
    openGraph: {
      type: ogType,
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => (l === 'es' ? 'es_ES' : 'en_US')),
      url: canonicalUrl,
      siteName: brand.name,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      ...(brand.seo.twitterHandle && {
        site: brand.seo.twitterHandle,
        creator: brand.seo.twitterHandle,
      }),
    },

    // Robots
    robots: robotsContent,

    // Verification (if configured)
    ...(brand.seo.verification.google && {
      verification: {
        google: brand.seo.verification.google,
        ...(brand.seo.verification.bing && {
          other: { 'msvalidate.01': brand.seo.verification.bing },
        }),
      },
    }),
  };
}

/**
 * Generates default metadata for the root layout
 * Used when no page-specific metadata is provided
 */
export function generateRootMetadata(locale: Locale): Metadata {
  const baseUrl = brand.website.replace(/\/$/, '');

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: brand.seo.defaultTitle,
      template: brand.seo.titleTemplate,
    },
    description: brand.seo.defaultDescription,
    keywords: brand.seo.keywords,

    // Default Open Graph
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      siteName: brand.name,
      title: brand.seo.defaultTitle,
      description: brand.seo.defaultDescription,
      images: [
        {
          url: `${baseUrl}${brand.seo.ogImage}`,
          width: 1200,
          height: 630,
          alt: brand.name,
        },
      ],
    },

    // Default Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: brand.seo.defaultTitle,
      description: brand.seo.defaultDescription,
      images: [`${baseUrl}${brand.seo.ogImage}`],
      ...(brand.seo.twitterHandle && {
        site: brand.seo.twitterHandle,
      }),
    },

    // Icons (PNG generated via app/icon.tsx + app/apple-icon.tsx)
    icons: {
      icon: [{ url: '/icon', sizes: '512x512', type: 'image/png' }],
      apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    },

    // PWA — iOS Safari needs this (ignores the web manifest)
    appleWebApp: {
      capable: true,
      title: 'LevelUP',
      statusBarStyle: 'black-translucent',
    },

    // Verification
    ...(brand.seo.verification.google && {
      verification: {
        google: brand.seo.verification.google,
      },
    }),
  };
}
