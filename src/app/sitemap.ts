import type { MetadataRoute } from 'next';
import { brand } from '@/shared/config/brand';
import { locales } from '@/i18n/request';

/**
 * Dynamic sitemap generation
 *
 * Generates a sitemap.xml with all public pages for each locale.
 * This helps search engines and AI crawlers discover your content.
 *
 * To add new pages:
 * 1. Add the path to the `publicPages` array below
 * 2. Set appropriate priority and changeFrequency
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = brand.website.replace(/\/$/, '');

  /**
   * Public pages to include in sitemap
   * - path: URL path without locale prefix
   * - priority: 0.0 to 1.0 (higher = more important)
   * - changeFrequency: how often the page changes
   */
  const publicPages: Array<{
    path: string;
    priority: number;
    changeFrequency:
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | 'never';
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
  ];

  // Generate sitemap entries for each locale
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const page of publicPages) {
    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${page.path}`;

      // Generate alternates for hreflang
      const alternates: Record<string, string> = {};
      for (const altLocale of locales) {
        alternates[altLocale] = `${baseUrl}/${altLocale}${page.path}`;
      }
      // Add x-default pointing to default locale (en)
      alternates['x-default'] = `${baseUrl}/en${page.path}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  return sitemapEntries;
}
