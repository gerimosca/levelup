/**
 * Central Project Configuration
 * Single source of truth for all project information
 * Used by: SEO, Home, Brand, Emails, etc.
 *
 * Run 'npm run project:setup' to configure interactively
 */

export interface ProjectConfig {
  business: {
    // Basic Info
    name: string;
    domain: string;
    type: 'b2b-saas' | 'b2c-saas' | 'marketplace' | 'dev-tool' | 'ai-product' | 'other';
    industry: string;

    // Core Messaging (used everywhere)
    tagline: string; // Short, punchy (3-5 words)
    elevator_pitch: string; // One sentence value prop

    // Features (for home, SEO, marketing)
    core_features: string[]; // 3-5 main features

    // Target Market
    target_personas: string[]; // e.g., ['startups', 'developers', 'agencies']
    ideal_customer: string; // e.g., "SaaS founders who want to ship fast"

    // Positioning
    main_competitor?: string; // For alternative pages
    unique_value: string; // What makes you different

    // Growth
    pricing_model: 'freemium' | 'trial' | 'paid-only' | 'usage-based';
    starting_price?: number; // For "Starting at $X"
  };

  // Auto-generated or override
  seo?: {
    keywords?: string[];
    defaultTitle?: string;
    defaultDescription?: string;
  };

  // Preferences
  preferences: {
    auto_translate: boolean; // Auto-generate Spanish from English
    content_tone: 'professional' | 'casual' | 'playful' | 'technical';
    cta_style: 'direct' | 'benefit-focused' | 'urgency';
  };
}

// Default configuration - TO BE REPLACED by project:setup command
export const projectConfig: ProjectConfig = {
  business: {
    // TODO: Run 'npm run project:setup' to configure these
    name: 'YourSaaS',
    domain: 'yoursaas.com',
    type: 'b2b-saas',
    industry: 'productivity',

    tagline: 'Ship Faster',
    elevator_pitch: 'The fastest way to build and deploy production-ready SaaS applications',

    core_features: [
      'Authentication & Authorization',
      'Stripe Billing Integration',
      'Admin Dashboard',
      'Multi-language Support',
      'AI-Powered Features'
    ],

    target_personas: ['startups', 'developers', 'agencies'],
    ideal_customer: 'Technical founders building their first SaaS',

    main_competitor: 'Vercel',
    unique_value: 'Only boilerplate with Claude Code integration built-in',

    pricing_model: 'freemium',
    starting_price: 29
  },

  preferences: {
    auto_translate: true,
    content_tone: 'professional',
    cta_style: 'benefit-focused'
  }
};

/**
 * Helper to get project info from anywhere
 */
export function getProjectInfo() {
  return projectConfig.business;
}

/**
 * Helper to get SEO defaults
 */
export function getSEODefaults() {
  const { name, tagline, elevator_pitch } = projectConfig.business;
  return {
    titleTemplate: `%s | ${name}`,
    defaultTitle: `${name} - ${tagline}`,
    defaultDescription: elevator_pitch,
    keywords: projectConfig.seo?.keywords || []
  };
}