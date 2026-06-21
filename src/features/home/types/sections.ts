/**
 * Admin-Ready Section Types
 * These types define the structure for all home page sections
 * Ready for future admin panel editing and A/B testing
 */

// Base type for all sections
export interface SectionContent<T = any> {
  id: string;
  enabled: boolean;
  order: number;
  variant?: 'A' | 'B';
  content: T;
  metadata?: {
    lastModified?: string;
    modifiedBy?: string;
    performance?: {
      impressions: number;
      conversions: number;
    };
  };
}

// Hero Section
export interface HeroContent {
  badge?: {
    text: Record<string, string>;
    icon?: string;
    href?: string;
  };
  headline: Record<string, string>; // { en: "...", es: "..." }
  headlineHighlight?: Record<string, string>; // Part to highlight with gradient
  subheadline: Record<string, string>;
  ctaPrimary: {
    text: Record<string, string>;
    href: string;
    style?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
    icon?: string;
  };
  ctaSecondary?: {
    text: Record<string, string>;
    href: string;
    style?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  };
  trustBadges?: Array<{
    text: string;
    icon?: string;
    highlighted?: boolean;
  }>;
  socialProofText?: Record<string, string>; // "Join 500+ developers"
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundEffect?: 'dots' | 'grid' | 'gradient' | 'none';
}

// Features Section
export interface FeaturesContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  layout: 'grid' | 'list' | 'carousel' | 'bento' | 'alternating';
  features: Array<{
    id: string;
    icon: string; // Icon component name or URL
    title: Record<string, string>;
    description: Record<string, string>;
    highlight?: boolean;
    link?: string;
    badge?: Record<string, string>; // "New", "Popular", etc.
  }>;
}

// Social Proof Section
export interface SocialProofContent {
  type: 'logos' | 'testimonials' | 'stats' | 'mixed' | 'wall-of-love';
  headline?: Record<string, string>;
  subheadline?: Record<string, string>;
  items: Array<{
    id: string;
    type: 'logo' | 'testimonial' | 'stat' | 'tweet';
    content: SocialProofItem;
  }>;
}

export type SocialProofItem =
  | LogoItem
  | TestimonialItem
  | StatItem
  | TweetItem;

export interface LogoItem {
  name: string;
  logo: string; // URL
  url?: string;
}

export interface TestimonialItem {
  quote: Record<string, string>;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface StatItem {
  value: string;
  label: Record<string, string>;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string; // "$", "+", etc.
  suffix?: string; // "%", "k", etc.
}

export interface TweetItem {
  tweetId: string;
  fallbackContent?: Record<string, string>;
}

// Pricing Section
export interface PricingContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  stripePricingTableId: string;
  stripePricingTablePublishableKey: string;
  showComparison?: boolean;
  customMessage?: Record<string, string>;
  badge?: {
    text: Record<string, string>;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

// CTA Section
export interface CTAContent {
  style: 'centered' | 'split' | 'minimal' | 'gradient';
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  ctaPrimary: {
    text: Record<string, string>;
    href: string;
    style?: string;
  };
  ctaSecondary?: {
    text: Record<string, string>;
    href: string;
  };
  backgroundImage?: string;
  backgroundColor?: string;
}

// FAQ Section
export interface FAQContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  layout: 'accordion' | 'grid' | 'two-column';
  items: Array<{
    id: string;
    question: Record<string, string>;
    answer: Record<string, string>;
    category?: string;
  }>;
  showContactCTA?: boolean;
}

// How It Works Section
export interface HowItWorksContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  layout: 'timeline' | 'cards' | 'numbered' | 'visual';
  steps: Array<{
    id: string;
    number?: string;
    title: Record<string, string>;
    description: Record<string, string>;
    icon?: string;
    image?: string;
  }>;
}

// Problem/Solution Section (Comparison)
export interface ProblemSolutionContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  problem: {
    title: Record<string, string>;
    points: Array<{
      id: string;
      text: Record<string, string>;
      icon?: string; // X or negative icon
    }>;
    timeEstimate?: Record<string, string>; // "6 months building..."
  };
  solution: {
    title: Record<string, string>;
    points: Array<{
      id: string;
      text: Record<string, string>;
      icon?: string; // Check or positive icon
    }>;
    timeEstimate?: Record<string, string>; // "3 days shipping..."
  };
}

// Tech Stack Section
export interface TechStackContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  categories: Array<{
    id: string;
    name: Record<string, string>;
    technologies: Array<{
      name: string;
      logo: string; // URL or icon name
      version?: string;
      badge?: Record<string, string>; // "Latest", "LTS", etc.
      url?: string;
    }>;
  }>;
  showVersions?: boolean;
}

// Developer/Founder Section (Social Proof)
export interface FounderProofContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  founders: Array<{
    name: string;
    avatar: string;
    role: Record<string, string>;
    bio: Record<string, string>;
    stats?: Array<{
      value: string;
      label: Record<string, string>;
    }>;
    social?: {
      twitter?: string;
      github?: string;
      linkedin?: string;
    };
  }>;
}

// Live Activity Ticker (FOMO)
export interface ActivityTickerContent {
  enabled: boolean;
  position: 'hero' | 'header' | 'floating';
  activities: Array<{
    template: Record<string, string>; // "{user} just {action}"
    users: string[]; // Pool of random names
    actions: Record<string, string[]>; // Pool of actions per language
    timeRanges: [number, number]; // [min, max] seconds ago
  }>;
  refreshInterval: number; // milliseconds
}

// Urgency/FOMO Section
export interface UrgencyContent {
  enabled: boolean;
  type: 'countdown' | 'limited-spots' | 'discount' | 'social-activity' | 'mixed';
  position: 'top' | 'hero' | 'floating' | 'before-pricing';
  content: {
    message: Record<string, string>;
    highlight?: Record<string, string>;
    endDate?: string; // ISO date for countdown
    spotsLeft?: number; // For limited spots
    discountPercentage?: number;
    discountCode?: string;
    originalPrice?: string;
    discountedPrice?: string;
    recentActivity?: Array<{
      user: string;
      action: Record<string, string>;
      timeAgo: Record<string, string>;
    }>;
  };
  style?: 'banner' | 'card' | 'floating' | 'inline';
}

// Affiliate Module Section
export interface AffiliateModuleContent {
  badge?: {
    text: Record<string, string>;
    variant?: string;
  };
  headline: Record<string, string>;
  subheadline: Record<string, string>;
  features: Array<{
    icon: string;
    title: Record<string, string>;
    description: Record<string, string>;
  }>;
  stats?: Array<{
    value: Record<string, string>;
    label: Record<string, string>;
  }>;
  cta: {
    text: Record<string, string>;
    href: string;
  };
  ctaSubtext?: Record<string, string>;
}

// Complete Home Content
export interface HomePageContent {
  // Core sections
  hero: SectionContent<HeroContent>;
  problemSolution?: SectionContent<ProblemSolutionContent>;
  features: SectionContent<FeaturesContent>;
  howItWorks?: SectionContent<HowItWorksContent>;
  techStack?: SectionContent<TechStackContent>;

  // Social proof sections
  socialProof: SectionContent<SocialProofContent>;
  founderProof?: SectionContent<FounderProofContent>;
  activityTicker?: SectionContent<ActivityTickerContent>;

  // Conversion sections
  pricing: SectionContent<PricingContent>;
  affiliateModule?: SectionContent<AffiliateModuleContent>;
  urgency?: SectionContent<UrgencyContent>;
  faq?: SectionContent<FAQContent>;
  cta: SectionContent<CTAContent>;
}