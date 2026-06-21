#!/usr/bin/env node

/**
 * Home Content Generator
 * Automatically generates home page content based on project configuration
 * Minimizes manual input while creating high-converting copy
 *
 * Run with: npm run home:generate
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`)
};

/**
 * Load project configuration
 */
function loadProjectConfig() {
  // Try to load generated config first
  const generatedPath = join(rootDir, 'src/core/shared/config/project.config.generated.ts');
  const defaultPath = join(rootDir, 'src/core/shared/config/project.config.ts');

  let configPath = existsSync(generatedPath) ? generatedPath : defaultPath;

  if (!existsSync(configPath)) {
    log.error('Project configuration not found. Run "npm run project:setup" first.');
    process.exit(1);
  }

  // Read and parse the TypeScript file (simplified parsing)
  const content = readFileSync(configPath, 'utf-8');

  // Extract the config object (this is a simplified parser)
  const configMatch = content.match(/projectConfig[:\s]*(?:ProjectConfig\s*=\s*)?({[\s\S]*?})\s*(?:;|$)/);

  if (!configMatch) {
    log.error('Could not parse project configuration');
    process.exit(1);
  }

  try {
    // Clean up TypeScript syntax for JSON parsing
    let configStr = configMatch[1]
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Quote keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Convert single quotes to double
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

    return JSON.parse(configStr);
  } catch (e) {
    // If JSON parse fails, return a default config
    log.warn('Using default configuration. Some values may need adjustment.');
    return {
      business: {
        name: 'YourSaaS',
        tagline: 'Ship Faster',
        elevator_pitch: 'The fastest way to build and deploy production-ready SaaS',
        core_features: [
          'Authentication Ready',
          'Billing Integration',
          'Admin Dashboard'
        ],
        target_personas: ['startups', 'developers'],
        ideal_customer: 'SaaS founders who want to ship fast',
        unique_value: 'Only boilerplate with Claude Code integration',
        type: 'b2b-saas',
        industry: 'developer-tools',
        pricing_model: 'freemium'
      },
      preferences: {
        content_tone: 'professional',
        cta_style: 'benefit-focused'
      }
    };
  }
}

/**
 * Generate home content based on config
 */
function generateHomeContent(config) {
  const { business, preferences } = config;

  // Generate CTAs based on style preference
  const ctaTexts = {
    direct: {
      primary: { en: 'Get Started', es: 'Comenzar' },
      secondary: { en: 'View Demo', es: 'Ver Demo' }
    },
    'benefit-focused': {
      primary: { en: `Start ${business.tagline}`, es: `Comienza a ${translateSimple(business.tagline)}` },
      secondary: { en: 'See How It Works', es: 'Ver Cómo Funciona' }
    },
    urgency: {
      primary: { en: 'Start Free Today', es: 'Empieza Gratis Hoy' },
      secondary: { en: 'Limited Time Offer', es: 'Oferta Limitada' }
    }
  };

  const cta = ctaTexts[preferences.cta_style] || ctaTexts.direct;

  // Generate trust badges based on type
  const trustBadges = [];
  if (business.type.includes('ai')) {
    trustBadges.push({ text: 'AI-Powered', icon: 'Bot', highlighted: true });
  }
  if (business.type.includes('b2b')) {
    trustBadges.push({ text: 'Enterprise Ready', icon: 'Building' });
  }
  trustBadges.push(
    { text: 'Stripe Verified', icon: 'CreditCard' },
    { text: 'SOC2 Compliant', icon: 'Shield' }
  );

  // Generate features with icons
  const featureIcons = ['Zap', 'Shield', 'CreditCard', 'Bot', 'Gauge', 'Globe', 'Users', 'Database'];
  const features = business.core_features.map((feature, idx) => ({
    id: `feature-${idx + 1}`,
    icon: featureIcons[idx] || 'Star',
    title: {
      en: feature,
      es: translateSimple(feature)
    },
    description: {
      en: generateFeatureDescription(feature, business.type),
      es: translateSimple(generateFeatureDescription(feature, business.type))
    },
    highlight: idx === 0 // Highlight first feature
  }));

  // Generate social proof based on industry
  const socialProofTemplates = {
    'developer-tools': '⚡ 500+ developers shipped this month',
    'b2b-saas': '🚀 Trusted by 200+ companies',
    'b2c-saas': '❤️ Loved by 10,000+ users',
    'ai-product': '🤖 1M+ AI requests processed',
    'marketplace': '💰 $100K+ in transactions'
  };

  const socialProof = socialProofTemplates[business.type] || socialProofTemplates['b2b-saas'];

  // Build complete home content structure
  const homeContent = {
    hero: {
      id: 'hero-main',
      enabled: true,
      order: 1,
      content: {
        badge: {
          text: {
            en: business.type.includes('ai') ? '🤖 AI-Native' : '🚀 Production Ready',
            es: business.type.includes('ai') ? '🤖 Nativo con IA' : '🚀 Listo para Producción'
          },
          icon: 'Sparkles'
        },
        headline: {
          en: business.elevator_pitch.split('.')[0], // First sentence
          es: translateSimple(business.elevator_pitch.split('.')[0])
        },
        headlineHighlight: {
          en: business.tagline,
          es: translateSimple(business.tagline)
        },
        subheadline: {
          en: business.elevator_pitch,
          es: translateSimple(business.elevator_pitch)
        },
        ctaPrimary: {
          text: cta.primary,
          href: '/register',
          style: 'default',
          icon: 'ArrowRight'
        },
        ctaSecondary: {
          text: cta.secondary,
          href: '#demo',
          style: 'outline'
        },
        trustBadges,
        socialProofText: {
          en: socialProof,
          es: translateSimple(socialProof)
        },
        backgroundEffect: 'dots'
      }
    },

    problemSolution: {
      id: 'problem-solution',
      enabled: true,
      order: 2,
      content: {
        headline: {
          en: `Stop Building, Start ${business.tagline}`,
          es: `Deja de Construir, Empieza a ${translateSimple(business.tagline)}`
        },
        problem: {
          title: {
            en: 'Without ' + business.name,
            es: 'Sin ' + business.name
          },
          points: [
            {
              id: 'p1',
              text: {
                en: 'Months building basic features',
                es: 'Meses construyendo funciones básicas'
              },
              icon: 'X'
            },
            {
              id: 'p2',
              text: {
                en: 'Complex integrations and setup',
                es: 'Integraciones y configuración complejas'
              },
              icon: 'X'
            },
            {
              id: 'p3',
              text: {
                en: 'Security and compliance headaches',
                es: 'Dolores de cabeza con seguridad y cumplimiento'
              },
              icon: 'X'
            }
          ]
        },
        solution: {
          title: {
            en: 'With ' + business.name,
            es: 'Con ' + business.name
          },
          points: [
            {
              id: 's1',
              text: {
                en: 'Ship in days, not months',
                es: 'Lanza en días, no meses'
              },
              icon: 'Check'
            },
            {
              id: 's2',
              text: {
                en: 'Everything pre-integrated',
                es: 'Todo pre-integrado'
              },
              icon: 'Check'
            },
            {
              id: 's3',
              text: {
                en: 'Enterprise-grade security built-in',
                es: 'Seguridad empresarial incorporada'
              },
              icon: 'Check'
            }
          ]
        }
      }
    },

    features: {
      id: 'features-main',
      enabled: true,
      order: 3,
      content: {
        headline: {
          en: 'Everything You Need to ' + business.tagline,
          es: 'Todo lo que Necesitas para ' + translateSimple(business.tagline)
        },
        subheadline: {
          en: `Built for ${business.target_personas.join(' and ')}, by developers who understand your needs`,
          es: `Construido para ${business.target_personas.map(p => translateSimple(p)).join(' y ')}, por desarrolladores que entienden tus necesidades`
        },
        layout: 'bento',
        features
      }
    },

    socialProof: {
      id: 'social-proof',
      enabled: true,
      order: 4,
      content: {
        type: 'testimonials',
        headline: {
          en: `${business.target_personas[0].charAt(0).toUpperCase() + business.target_personas[0].slice(1)} Love ${business.name}`,
          es: `${translateSimple(business.target_personas[0])} Aman ${business.name}`
        },
        items: generateTestimonials(business)
      }
    },

    pricing: {
      id: 'pricing-section',
      enabled: true,
      order: 5,
      content: {
        headline: {
          en: getPricingHeadline(business.pricing_model),
          es: translateSimple(getPricingHeadline(business.pricing_model))
        },
        subheadline: {
          en: 'No hidden fees. Cancel anytime.',
          es: 'Sin cargos ocultos. Cancela cuando quieras.'
        },
        stripePricingTableId: 'prctbl_1234567890', // Placeholder
        showComparison: true
      }
    },

    finalCta: {
      id: 'final-cta',
      enabled: true,
      order: 6,
      content: {
        headline: {
          en: `Ready to ${business.tagline}?`,
          es: `¿Listo para ${translateSimple(business.tagline)}?`
        },
        subheadline: {
          en: `Join ${business.target_personas[0]} who are already using ${business.name}`,
          es: `Únete a ${translateSimple(business.target_personas[0])} que ya están usando ${business.name}`
        },
        ctaText: cta.primary,
        ctaHref: '/register'
      }
    }
  };

  return homeContent;
}

/**
 * Generate feature description based on feature name and business type
 */
function generateFeatureDescription(feature, businessType) {
  const descriptions = {
    'Authentication': 'Secure login with magic links, OAuth, and 2FA support',
    'Billing': 'Stripe integration with subscriptions and usage-based billing',
    'Admin Dashboard': 'Powerful admin tools to manage users and content',
    'AI': 'Claude and GPT integration for intelligent features',
    'Analytics': 'Real-time insights into user behavior and metrics',
    'Multi-language': 'Support for multiple languages out of the box'
  };

  // Find matching description
  for (const [key, desc] of Object.entries(descriptions)) {
    if (feature.toLowerCase().includes(key.toLowerCase())) {
      return desc;
    }
  }

  // Default description
  return `Enterprise-grade ${feature.toLowerCase()} for modern ${businessType.replace('-', ' ')} applications`;
}

/**
 * Generate testimonials based on target personas
 */
function generateTestimonials(business) {
  const templates = [
    {
      author: 'Sarah Chen',
      role: 'Founder',
      company: 'TechStartup',
      avatar: '/avatars/avatar-1.jpg',
      content: {
        en: `${business.name} saved us months of development time. We launched in 2 weeks instead of 6 months.`,
        es: `${business.name} nos ahorró meses de desarrollo. Lanzamos en 2 semanas en lugar de 6 meses.`
      },
      rating: 5
    },
    {
      author: 'Michael Rodriguez',
      role: 'CTO',
      company: 'ScaleUp Inc',
      avatar: '/avatars/avatar-2.jpg',
      content: {
        en: `The ${business.unique_value.toLowerCase()} is a game-changer. Exactly what we needed.`,
        es: `El ${translateSimple(business.unique_value.toLowerCase())} es revolucionario. Exactamente lo que necesitábamos.`
      },
      rating: 5
    },
    {
      author: 'Emily Johnson',
      role: 'Developer',
      company: 'DevAgency',
      avatar: '/avatars/avatar-3.jpg',
      content: {
        en: `Best investment for our agency. We can now ship client projects 10x faster.`,
        es: `La mejor inversión para nuestra agencia. Ahora podemos entregar proyectos 10 veces más rápido.`
      },
      rating: 5
    }
  ];

  return templates.map((t, idx) => ({
    id: `testimonial-${idx + 1}`,
    type: 'testimonial',
    content: t
  }));
}

/**
 * Get pricing headline based on model
 */
function getPricingHeadline(model) {
  const headlines = {
    'freemium': 'Start Free, Upgrade When You Grow',
    'trial': 'Start Your Free Trial Today',
    'paid-only': 'Simple, Transparent Pricing',
    'usage-based': 'Pay Only for What You Use'
  };
  return headlines[model] || headlines['paid-only'];
}

/**
 * Simple translation helper (placeholder - should use proper i18n)
 */
function translateSimple(text) {
  if (!text) return '';

  const translations = {
    'ship faster': 'lanza más rápido',
    'build faster': 'construye más rápido',
    'ship': 'lanzar',
    'build': 'construir',
    'startups': 'startups',
    'developers': 'desarrolladores',
    'agencies': 'agencias',
    'enterprises': 'empresas',
    'authentication': 'autenticación',
    'billing': 'facturación',
    'admin': 'administración',
    'dashboard': 'panel',
    'ready': 'listo',
    'integration': 'integración',
    'the fastest way': 'la forma más rápida'
  };

  let translated = text.toLowerCase();
  Object.entries(translations).forEach(([en, es]) => {
    translated = translated.replace(new RegExp(en, 'gi'), es);
  });

  // Capitalize first letter
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

/**
 * Main function
 */
async function generate() {
  console.log('\n🏠 Home Content Generator\n');

  // Load project configuration
  log.info('Loading project configuration...');
  const config = loadProjectConfig();

  log.success(`Loaded config for: ${config.business.name}`);

  // Generate home content
  log.info('Generating home content...');
  const homeContent = generateHomeContent(config);

  // Write to file
  const outputPath = join(rootDir, 'src/core/features/home/config/content.generated.ts');
  const output = `/**
 * Home Page Content - Auto-Generated
 * Generated from project configuration
 *
 * Generated on: ${new Date().toISOString()}
 *
 * To regenerate: npm run home:generate
 * To modify source data: Edit project.config.ts then regenerate
 */

import type { HomePageContent } from '../types/sections';

export const homeContent: HomePageContent = ${JSON.stringify(homeContent, null, 2)};
`;

  writeFileSync(outputPath, output);
  log.success('Generated content.generated.ts');

  // Summary
  console.log('\n✅ Home content generated successfully!');
  console.log('\n📁 Files created:');
  console.log('  • src/core/features/home/config/content.generated.ts');
  console.log('\n🚀 Next steps:');
  console.log('  1. Review the generated content');
  console.log('  2. Import in your home page: import { homeContent } from "@/features/home/config/content.generated"');
  console.log('  3. Customize as needed');
  console.log('\n💡 Tips:');
  console.log('  • Re-run this command anytime to regenerate');
  console.log('  • Edit project.config.ts to change source data');
  console.log('  • Generated content maintains admin-ready architecture');
}

// Run generator
generate().catch(error => {
  log.error(`Generation failed: ${error.message}`);
  process.exit(1);
});