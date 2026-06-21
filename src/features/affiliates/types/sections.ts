/**
 * Affiliate Page Section Types
 * Aligned with home page patterns for consistency and A/B testing
 */

// Affiliate Hero Section
export interface AffiliateHeroContent {
  headline: Record<string, string>;
  subheadline: Record<string, string>;
  ctaPrimary: {
    text: Record<string, string>;
    href: string;
    icon?: string;
  };
  subtext?: Record<string, string>;
}

// How It Works Section (reuse from home)
export interface HowItWorksContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  steps: Array<{
    number: string;
    title: Record<string, string>;
    description: Record<string, string>;
    icon?: string;
  }>;
}

// Simple Calculator Section
export interface SimpleCalculatorContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  inputLabel: Record<string, string>;
  outputLabel: Record<string, string>;
  helpText: Record<string, string>;
  // Settings from admin
  commissionRate?: number; // Percentage (e.g., 30)
  averageSalePrice?: number; // Price in euros (e.g., 297)
  defaultReferrals?: number; // Default input value (e.g., 5)
}

// Benefits Section (similar to features)
export interface BenefitsContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  benefits: Array<{
    icon: string;
    title: Record<string, string>;
    description: Record<string, string>;
    highlight?: boolean;
  }>;
}

// FAQ Section (reuse from home)
export interface FAQContent {
  headline: Record<string, string>;
  questions: Array<{
    id: string;
    question: Record<string, string>;
    answer: Record<string, string>;
  }>;
}

// Application Form Section
export interface ApplicationContent {
  headline: Record<string, string>;
  subheadline: Record<string, string>;
  formUrl?: string; // Rewardful URL from admin
  notConfiguredMessage: Record<string, string>;
  features?: Array<{
    text: Record<string, string>;
    icon?: string;
  }>;
}

// Complete Affiliate Page Content
export interface AffiliatePageContent {
  hero: {
    id: string;
    enabled: boolean;
    order: number;
    content: AffiliateHeroContent;
  };
  howItWorks: {
    id: string;
    enabled: boolean;
    order: number;
    content: HowItWorksContent;
  };
  calculator: {
    id: string;
    enabled: boolean;
    order: number;
    content: SimpleCalculatorContent;
  };
  benefits: {
    id: string;
    enabled: boolean;
    order: number;
    content: BenefitsContent;
  };
  faq: {
    id: string;
    enabled: boolean;
    order: number;
    content: FAQContent;
  };
  application: {
    id: string;
    enabled: boolean;
    order: number;
    content: ApplicationContent;
  };
}