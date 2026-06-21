/**
 * Home Feature Exports
 * Central export point for all home-related components and utilities
 */

// Types
export * from './types/sections';

// Base Components
export { SectionWrapper } from '@/shared/components/layout';

// Section Components
export { HeroSection } from './components/sections/hero-section';
export { ProblemSolutionSection } from './components/sections/problem-solution-section';
export { FeaturesSection } from './components/sections/features-section';
export { HowItWorksSection } from './components/sections/how-it-works-section';
export { TechStackSection } from './components/sections/tech-stack-section';
export { SocialProofSection } from './components/sections/social-proof-section';
export { PricingSection } from './components/sections/pricing-section';
export { AffiliateModuleSection } from './components/sections/affiliate-module-section';
export { UrgencySection } from './components/sections/urgency-section';
export { FAQSection } from './components/sections/faq-section';
export { CTASection } from './components/sections/cta-section';

// Content & Config
export { homeContent, getHomeContent, getHomeSection } from './config/content';

// Tracking utilities
export {
  trackImpression,
  trackClick,
  trackConversion,
  trackInteraction,
  getVariantAssignment,
  hasConverted,
  initializeTracking
} from './lib/tracking';