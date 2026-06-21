# SEO & GEO Configuration Guide

This guide explains how to configure Search Engine Optimization (SEO) and Generative Engine Optimization (GEO) for your SaaS application.

## Overview

The boilerplate includes:
- **SEO**: Traditional search engine optimization (Google, Bing)
- **GEO**: AI search optimization (ChatGPT, Claude, Perplexity)

All configuration is centralized in `src/shared/config/brand.ts`.

## Quick Start

SEO/GEO is automatically configured when you run:

```bash
npm run setup
```

The setup wizard will ask for:
- Product name and tagline
- Website URL
- Meta description
- Social links
- AI bot crawling preferences

### Adding New Pages

Use the Claude Code command to create pages with full SEO setup:

```bash
/add-page blog
```

This automatically:
- Creates the page file with `generateMetadata`
- Adds the route to `sitemap.ts`
- Generates SEO translations for en/es
- Sets up content translations

## Configuration

### Brand Configuration (`src/shared/config/brand.ts`)

This is the single source of truth for all SEO/GEO settings:

```typescript
export const brand = {
  // Basic identity
  name: 'Your Product',
  tagline: 'Your tagline',
  website: 'https://yourdomain.com',

  // SEO settings
  seo: {
    titleTemplate: '%s | Your Product',
    defaultTitle: 'Your Product - Your tagline',
    defaultDescription: 'Your meta description (max 160 chars)',
    keywords: ['keyword1', 'keyword2'],
    ogImage: '/og-image.png',
    twitterHandle: '@yourhandle',
    verification: {
      google: '', // Google Search Console code
      bing: '',   // Bing Webmaster code
    },
  },

  // Social links (used in schemas)
  social: {
    twitter: 'https://twitter.com/yourhandle',
    github: 'https://github.com/yourrepo',
    linkedin: 'https://linkedin.com/company/yours',
  },

  // Organization info (for schema.org)
  organization: {
    type: 'Organization',
    foundingDate: '2024',
    founders: ['Founder Name'],
  },

  // AI crawler settings
  crawlers: {
    allowAIBots: true, // Allow GPTBot, ClaudeBot, etc.
    disallowPaths: ['/app/', '/auth/', '/api/'],
  },
};
```

### Page Metadata

Use the `generatePageMetadata` helper for page-specific metadata:

```typescript
// src/app/[locale]/(landing)/pricing/page.tsx
import { generatePageMetadata } from '@/shared/lib/metadata';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return generatePageMetadata({
    title: t('pricing.title'),
    description: t('pricing.description'),
    locale,
    path: '/pricing',
  });
}
```

### JSON-LD Schemas

Add structured data to help search engines and AI understand your content:

```typescript
import {
  SoftwareApplicationSchema,
  FAQPageSchema,
  BreadcrumbSchema,
} from '@/shared/components/seo/json-ld';

export default function PricingPage() {
  return (
    <>
      <SoftwareApplicationSchema
        applicationCategory="WebApplication"
        offers={{
          price: '0',
          priceCurrency: 'USD',
        }}
      />
      <FAQPageSchema faqs={faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Pricing', url: '/pricing' },
        ]}
      />
      {/* Page content */}
    </>
  );
}
```

Available schema components:
- `OrganizationSchema` - Company information
- `WebsiteSchema` - Website information
- `SoftwareApplicationSchema` - SaaS product details
- `FAQPageSchema` - FAQ content
- `BreadcrumbSchema` - Navigation structure
- `ProductSchema` - Product with pricing tiers
- `GlobalSchemas` - Combines Organization + Website (added to layout)

## Generated Files

### robots.txt (`src/app/robots.ts`)

Automatically generated from `brand.crawlers` config:

```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /auth/
Disallow: /api/

User-agent: GPTBot
Allow: /
Disallow: /app/
...

Sitemap: https://yourdomain.com/sitemap.xml
```

### sitemap.xml (`src/app/sitemap.ts`)

Automatically generated with:
- All public pages
- All locales (en, es)
- hreflang alternates
- Priority and change frequency

To add new pages, edit the `publicPages` array in `src/app/sitemap.ts`.

## Translations

SEO-specific translations are in the `seo` namespace:

```json
// messages/en.json
{
  "seo": {
    "landing": {
      "title": "Build Your SaaS Faster",
      "description": "Production-ready boilerplate..."
    },
    "pricing": {
      "title": "Pricing Plans",
      "description": "Choose the perfect plan..."
    }
  }
}
```

FAQs for schema markup:

```json
{
  "faq": {
    "title": "Frequently Asked Questions",
    "items": [
      {
        "question": "What is included?",
        "answer": "Everything you need..."
      }
    ]
  }
}
```

## GEO Best Practices

### Content Structure

AI models prefer well-structured content:

1. **Clear headings**: Use proper h1 > h2 > h3 hierarchy
2. **Semantic HTML**: Use `<article>`, `<section>`, `<nav>`
3. **Concise paragraphs**: 2-3 sentences per paragraph
4. **Lists and bullets**: Easy to parse and extract
5. **FAQ sections**: Questions and answers format

### Schema Markup

JSON-LD schemas help AI understand your product:

- **SoftwareApplicationSchema**: Product category, features, pricing
- **FAQPageSchema**: Common questions (highly cited by AI)
- **ProductSchema**: Pricing tiers with descriptions

### AI Bot Access

The boilerplate allows these AI crawlers by default:
- GPTBot (OpenAI/ChatGPT)
- ChatGPT-User (ChatGPT browse mode)
- ClaudeBot (Anthropic/Claude)
- PerplexityBot (Perplexity AI)
- Google-Extended (Google AI)

To disable, set `brand.crawlers.allowAIBots = false`.

## Verification

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Get the verification code
4. Add to `brand.seo.verification.google`

### Testing Tools

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org/
- **Open Graph Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

### AI Search Testing

Manually test how your site appears in AI responses:

1. Ask ChatGPT: "What is [your product]?"
2. Ask Perplexity: "Tell me about [your product]"
3. Check if your content is cited/referenced

## Checklist

Before launch:

- [ ] Update `brand.ts` with real values
- [ ] Add og-image.png (1200x630) to `/public`
- [ ] Add favicon.ico to `/public`
- [ ] Set up Google Search Console
- [ ] Submit sitemap.xml
- [ ] Test Open Graph with Facebook debugger
- [ ] Test Twitter Cards
- [ ] Test JSON-LD with Schema validator
- [ ] Review robots.txt blocks correct paths

## Monitoring

### Tools

- **Google Search Console**: Track search performance
- **HubSpot AI Search Grader**: https://www.hubspot.com/ai-search-grader
- **Semrush**: AI search visibility tools

### Metrics to Track

- **SEO**: Click-through rate, impressions, rankings
- **GEO**: Brand mentions in AI responses, reference rate

## Troubleshooting

### Pages not indexed

1. Check robots.txt isn't blocking the page
2. Verify page is in sitemap.xml
3. Check for `noindex` meta tags
4. Submit URL in Google Search Console

### Open Graph not working

1. Clear cache on social platform
2. Verify og-image.png exists and is accessible
3. Check image dimensions (1200x630)
4. Use Facebook debugger to refresh cache

### Schema errors

1. Use Schema validator to check JSON-LD
2. Ensure all required fields are present
3. Check for malformed JSON

## Resources

- [Schema.org](https://schema.org/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [GEO: Generative Engine Optimization](https://a16z.com/geo-over-seo/)
