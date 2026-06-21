/**
 * Brand Configuration
 *
 * Centralizes all brand-related settings including SEO and GEO optimization.
 * Modify this file to customize your SaaS identity.
 *
 * This is the single source of truth for:
 * - Brand identity (name, logo, colors)
 * - SEO metadata (titles, descriptions, Open Graph)
 * - GEO optimization (schemas, AI bot access)
 * - Social presence
 */

export const brand = {
  // ═══════════════════════════════════════════════════════════════════
  // APP IDENTITY
  // ═══════════════════════════════════════════════════════════════════

  /** Your product/company name */
  name: 'AI SaaS',

  /** Short tagline (appears in hero, metadata) */
  tagline: 'Build faster with AI',

  // ═══════════════════════════════════════════════════════════════════
  // CONTACT & URLS
  // ═══════════════════════════════════════════════════════════════════

  /** Production website URL (used for canonical URLs, sitemap, schemas) */
  website: 'https://example.com',

  /** Support email address */
  support: 'support@example.com',

  // ═══════════════════════════════════════════════════════════════════
  // ASSETS (place files in /public/)
  // ═══════════════════════════════════════════════════════════════════

  /** Logo for header/navigation (SVG recommended) */
  logo: '/logo.svg',

  /** Small icon for favicon context */
  icon: '/icon.svg',

  /** Browser favicon */
  favicon: '/favicon.ico',

  // ═══════════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // To change font: see README.md in this folder for instructions
  // ═══════════════════════════════════════════════════════════════════

  font: {
    family: 'Inter',
    package: '@fontsource/inter',
    weights: [400, 500, 600, 700],
  },

  // ═══════════════════════════════════════════════════════════════════
  // UI THEME
  // ═══════════════════════════════════════════════════════════════════

  theme: {
    /**
     * Theme Variant
     *
     * Choose the visual style for your entire SaaS.
     * This affects colors, typography spacing, and overall feel.
     *
     * Available variants:
     * - 'standard': Modern, friendly, approachable
     *   Best for: General audience, B2C products
     *   Colors: Blue primary, light backgrounds, rounded corners
     *
     * - 'luxury': Premium, exclusive, prestigious
     *   Best for: High-end services, VIP products, professional tools
     *   Colors: Gold primary, deep black backgrounds, sharp corners
     *
     * - 'corporate': Professional, enterprise-ready (coming soon)
     *   Best for: B2B products, enterprise software
     *   Colors: Corporate blue, clean layouts, minimal
     */
    variant: 'standard' as const, // 'standard' | 'luxury' | 'corporate'

    /** Enable glassmorphism effect (backdrop-blur, transparency) */
    glass: false,
  },

  // ═══════════════════════════════════════════════════════════════════
  // SEO & GEO CONFIGURATION
  // This section controls metadata, Open Graph, and AI optimization
  // ═══════════════════════════════════════════════════════════════════

  seo: {
    /** Title template for pages. %s is replaced with page title */
    titleTemplate: '%s | AI SaaS',

    /** Default title when no page title is set */
    defaultTitle: 'AI SaaS - Build faster with AI',

    /** Default meta description (max 160 characters recommended) */
    defaultDescription:
      'Production-ready AI SaaS boilerplate with Next.js, Supabase, and Stripe',

    /** Keywords for meta tags (comma-separated) */
    keywords: ['saas', 'boilerplate', 'nextjs', 'supabase', 'stripe'],

    /** Default Open Graph image (1200x630 recommended) */
    ogImage: '/og-image.png',

    /** Twitter/X handle for Twitter Cards (include @) */
    twitterHandle: '',

    /** Site verification codes (leave empty if not using) */
    verification: {
      google: '', // Google Search Console
      bing: '', // Bing Webmaster
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // SOCIAL LINKS
  // Used in footer, schemas, and social proof
  // ═══════════════════════════════════════════════════════════════════

  social: {
    /** Twitter/X profile URL */
    twitter: '',

    /** GitHub repository or organization URL */
    github: '',

    /** LinkedIn company page URL */
    linkedin: '',

    /** YouTube channel URL */
    youtube: '',

    /** Discord server invite URL */
    discord: '',
  },

  // ═══════════════════════════════════════════════════════════════════
  // ORGANIZATION INFO (for Schema.org markup)
  // Helps search engines and AI understand your company
  // ═══════════════════════════════════════════════════════════════════

  organization: {
    /** Organization type for schema.org */
    type: 'Organization' as const, // 'Organization', 'Corporation', 'LocalBusiness'

    /** Year company was founded */
    foundingDate: '',

    /** Founder names (for schema) */
    founders: [] as string[],

    /** Physical address (optional, for LocalBusiness) */
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // CRAWLER & AI BOT CONFIGURATION
  // Controls robots.txt generation and AI search optimization (GEO)
  // ═══════════════════════════════════════════════════════════════════

  crawlers: {
    /**
     * Allow AI bots to crawl your site (recommended for GEO)
     * Includes: GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, etc.
     */
    allowAIBots: true,

    /**
     * Paths to disallow in robots.txt
     * Protected routes are automatically excluded
     */
    disallowPaths: ['/app/', '/auth/', '/api/', '/checkout/'],

    /**
     * Additional paths to allow (overrides disallow)
     * Example: ['/api/public/']
     */
    allowPaths: [] as string[],
  },

  // ═══════════════════════════════════════════════════════════════════
  // LEGAL PAGES
  // ═══════════════════════════════════════════════════════════════════

  legal: {
    terms: '/terms',
    privacy: '/privacy',
  },

  // ═══════════════════════════════════════════════════════════════════
  // AUTH PAGES CONFIGURATION
  // Customize the appearance of login, register, and other auth pages
  // ═══════════════════════════════════════════════════════════════════

  auth: {
    /** Show branding panel on desktop (split-screen layout) */
    showBrandingPanel: true,

    /** Gradient for branding panel background */
    gradient: 'from-primary/10 via-primary/5 to-background',

    /** Show animated background pattern */
    showPattern: true,

    /** Show testimonial in branding panel */
    showTestimonial: false,

    /** Testimonial content (if showTestimonial is true) */
    testimonial: {
      quote: 'This product transformed how we work.',
      author: 'John Doe',
      role: 'CEO at Company',
    },

    /** Features to highlight in branding panel */
    features: [
      'Start building in minutes',
      'Secure by default',
      'Scale as you grow',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════

  /** Copyright notice in footer */
  copyright: `© ${new Date().getFullYear()} AI SaaS. All rights reserved.`,
};

export type Brand = typeof brand;
