import { brand } from '@/shared/config/brand';

/**
 * JSON-LD Schema Components for SEO and GEO optimization
 *
 * These components generate structured data that helps:
 * - Search engines understand your content
 * - AI models (GPT, Claude, Perplexity) comprehend your product
 * - Enable rich snippets in search results
 *
 * Usage:
 * - OrganizationSchema + WebsiteSchema: Add to root layout (global)
 * - SoftwareApplicationSchema: Add to landing page
 * - FAQPageSchema: Add to pages with FAQ sections
 * - BreadcrumbSchema: Add to all pages for navigation context
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// ORGANIZATION SCHEMA
// Defines your company/organization for search engines and AI
// ═══════════════════════════════════════════════════════════════════

export function OrganizationSchema() {
  const socialLinks = Object.values(brand.social).filter(Boolean);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': brand.organization.type,
    name: brand.name,
    url: brand.website,
    logo: `${brand.website}${brand.logo}`,
    description: brand.seo.defaultDescription,
    email: brand.support,
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
    ...(brand.organization.foundingDate && {
      foundingDate: brand.organization.foundingDate,
    }),
    ...(brand.organization.founders.length > 0 && {
      founder: brand.organization.founders.map((name) => ({
        '@type': 'Person',
        name,
      })),
    }),
    ...(brand.organization.address.country && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: brand.organization.address.street,
        addressLocality: brand.organization.address.city,
        addressRegion: brand.organization.address.state,
        postalCode: brand.organization.address.postalCode,
        addressCountry: brand.organization.address.country,
      },
    }),
  };

  return <JsonLd data={data} />;
}

// ═══════════════════════════════════════════════════════════════════
// WEBSITE SCHEMA
// Defines your website and enables sitelinks search box
// ═══════════════════════════════════════════════════════════════════

export function WebsiteSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: brand.website,
    description: brand.seo.defaultDescription,
    publisher: {
      '@type': brand.organization.type,
      name: brand.name,
      logo: {
        '@type': 'ImageObject',
        url: `${brand.website}${brand.logo}`,
      },
    },
  };

  return <JsonLd data={data} />;
}

// ═══════════════════════════════════════════════════════════════════
// SOFTWARE APPLICATION SCHEMA
// Defines your SaaS product for rich results
// ═══════════════════════════════════════════════════════════════════

interface SoftwareApplicationSchemaProps {
  /** Application name (defaults to brand.name) */
  name?: string;
  /** Application description */
  description?: string;
  /** Application category */
  applicationCategory?:
    | 'BusinessApplication'
    | 'DeveloperApplication'
    | 'ProductivityApplication'
    | 'WebApplication';
  /** Operating system (e.g., 'Web', 'iOS', 'Android') */
  operatingSystem?: string;
  /** Pricing model */
  offers?: {
    price: string;
    priceCurrency: string;
    priceValidUntil?: string;
    availability?: 'InStock' | 'PreOrder' | 'SoldOut';
  };
  /** Aggregate rating (if you have reviews) */
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  /** Key features of the application */
  features?: string[];
}

export function SoftwareApplicationSchema({
  name = brand.name,
  description = brand.seo.defaultDescription,
  applicationCategory = 'WebApplication',
  operatingSystem = 'Web',
  offers,
  aggregateRating,
  features,
}: SoftwareApplicationSchemaProps = {}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    url: brand.website,
    image: `${brand.website}${brand.seo.ogImage}`,
    author: {
      '@type': brand.organization.type,
      name: brand.name,
    },
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
        availability: `https://schema.org/${offers.availability || 'InStock'}`,
        ...(offers.priceValidUntil && {
          priceValidUntil: offers.priceValidUntil,
        }),
      },
    }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(features && {
      featureList: features.join(', '),
    }),
  };

  return <JsonLd data={data} />;
}

// ═══════════════════════════════════════════════════════════════════
// FAQ PAGE SCHEMA
// Structured FAQ data for rich results and AI understanding
// ═══════════════════════════════════════════════════════════════════

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageSchemaProps {
  /** Array of FAQ items */
  faqs: FAQItem[];
}

export function FAQPageSchema({ faqs }: FAQPageSchemaProps) {
  if (!faqs || faqs.length === 0) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

// ═══════════════════════════════════════════════════════════════════
// BREADCRUMB SCHEMA
// Navigation structure for search engines
// ═══════════════════════════════════════════════════════════════════

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  /** Array of breadcrumb items (in order) */
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${brand.website}${item.url}`,
    })),
  };

  return <JsonLd data={data} />;
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT SCHEMA (for specific product/pricing pages)
// Defines a product with pricing tiers
// ═══════════════════════════════════════════════════════════════════

interface ProductOffer {
  name: string;
  price: string;
  priceCurrency: string;
  description?: string;
  features?: string[];
}

interface ProductSchemaProps {
  /** Product name */
  name?: string;
  /** Product description */
  description?: string;
  /** Array of pricing offers/tiers */
  offers: ProductOffer[];
  /** Product image URL */
  image?: string;
}

export function ProductSchema({
  name = brand.name,
  description = brand.seo.defaultDescription,
  offers,
  image = brand.seo.ogImage,
}: ProductSchemaProps) {
  const imageUrl = image.startsWith('http') ? image : `${brand.website}${image}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: brand.name,
    },
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      availability: 'https://schema.org/InStock',
      ...(offer.description && { description: offer.description }),
    })),
  };

  return <JsonLd data={data} />;
}

// ═══════════════════════════════════════════════════════════════════
// COMBINED GLOBAL SCHEMAS
// Convenience component for root layout
// ═══════════════════════════════════════════════════════════════════

export function GlobalSchemas() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
    </>
  );
}
