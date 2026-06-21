/**
 * SEO Content Generator
 * Automatically generates SEO metadata based on project configuration
 * Minimizes manual input while maximizing SEO effectiveness
 */

import { projectConfig, getProjectInfo } from '@/shared/config/project.config';

interface SEOGeneratorOptions {
  pageName: string;
  pageType?: 'marketing' | 'app' | 'legal' | 'blog' | 'feature';
  customKeyword?: string;
  locale?: 'en' | 'es';
}

interface GeneratedSEO {
  title: string;
  description: string;
  keywords: string[];
}

/**
 * Generates SEO metadata automatically based on page context
 */
export function generateSEO(options: SEOGeneratorOptions): GeneratedSEO {
  const { pageName, pageType = 'marketing', customKeyword, locale = 'en' } = options;
  const info = getProjectInfo();

  // Generate based on page type
  switch (pageType) {
    case 'marketing':
      return generateMarketingSEO(pageName, info, customKeyword, locale);
    case 'app':
      return generateAppSEO(pageName, info, locale);
    case 'legal':
      return generateLegalSEO(pageName, info, locale);
    case 'blog':
      return generateBlogSEO(pageName, info, customKeyword, locale);
    case 'feature':
      return generateFeatureSEO(pageName, info, customKeyword, locale);
    default:
      return generateDefaultSEO(pageName, info, locale);
  }
}

/**
 * Marketing pages (landing, pricing, etc.)
 */
function generateMarketingSEO(
  pageName: string,
  info: typeof projectConfig.business,
  keyword?: string,
  locale: 'en' | 'es' = 'en'
): GeneratedSEO {
  const templates = {
    en: {
      pricing: {
        title: `Pricing - Start ${info.pricing_model === 'freemium' ? 'Free' : `at $${info.starting_price}`}`,
        description: `Simple, transparent pricing for ${info.name}. ${info.elevator_pitch}. No hidden fees.`
      },
      features: {
        title: `Features - Everything You Need to ${info.tagline}`,
        description: `Discover all ${info.name} features: ${info.core_features.slice(0, 3).join(', ')}. Built for ${info.target_personas[0]}.`
      },
      about: {
        title: `About ${info.name} - ${info.tagline}`,
        description: `Learn how ${info.name} helps ${info.ideal_customer}. ${info.unique_value}.`
      },
      contact: {
        title: 'Get in Touch - We\'re Here to Help',
        description: `Questions about ${info.name}? Contact our team for ${info.type.includes('b2b') ? 'enterprise' : 'personal'} support.`
      },
      // Generic template for other marketing pages
      default: {
        title: `${capitalize(pageName)} - ${info.tagline}`,
        description: `${info.elevator_pitch} Explore our ${pageName.toLowerCase()} to ${info.tagline.toLowerCase()}.`
      }
    },
    es: {
      pricing: {
        title: `Precios - ${info.pricing_model === 'freemium' ? 'Empieza Gratis' : `Desde $${info.starting_price}`}`,
        description: `Precios simples y transparentes para ${info.name}. ${translateToSpanish(info.elevator_pitch)}. Sin costos ocultos.`
      },
      features: {
        title: `Características - Todo lo que Necesitas`,
        description: `Descubre todas las características de ${info.name}: ${info.core_features.slice(0, 3).map(f => translateToSpanish(f)).join(', ')}.`
      },
      about: {
        title: `Acerca de ${info.name} - ${translateToSpanish(info.tagline)}`,
        description: `Conoce cómo ${info.name} ayuda a ${translateToSpanish(info.ideal_customer)}. ${translateToSpanish(info.unique_value)}.`
      },
      contact: {
        title: 'Contáctanos - Estamos para Ayudarte',
        description: `¿Preguntas sobre ${info.name}? Contacta a nuestro equipo para soporte ${info.type.includes('b2b') ? 'empresarial' : 'personal'}.`
      },
      default: {
        title: `${capitalize(pageName)} - ${translateToSpanish(info.tagline)}`,
        description: `${translateToSpanish(info.elevator_pitch)} Explora ${pageName.toLowerCase()}.`
      }
    }
  };

  const template = templates[locale][pageName as keyof typeof templates[typeof locale]] || templates[locale].default;

  return {
    title: template.title,
    description: template.description,
    keywords: generateKeywords(info, pageName, keyword)
  };
}

/**
 * App pages (dashboard, settings, etc.)
 */
function generateAppSEO(
  pageName: string,
  info: typeof projectConfig.business,
  locale: 'en' | 'es' = 'en'
): GeneratedSEO {
  const titles = {
    en: `${capitalize(pageName)} - ${info.name}`,
    es: `${capitalize(pageName)} - ${info.name}`
  };

  const descriptions = {
    en: `Access your ${pageName} in ${info.name}. ${info.tagline}.`,
    es: `Accede a tu ${pageName} en ${info.name}. ${translateToSpanish(info.tagline)}.`
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: [info.name.toLowerCase(), pageName.toLowerCase(), ...info.industry.split('-')]
  };
}

/**
 * Legal pages (terms, privacy, etc.)
 */
function generateLegalSEO(
  pageName: string,
  info: typeof projectConfig.business,
  locale: 'en' | 'es' = 'en'
): GeneratedSEO {
  const legalTitles = {
    en: {
      terms: `Terms of Service - ${info.name}`,
      privacy: `Privacy Policy - ${info.name}`,
      cookies: `Cookie Policy - ${info.name}`,
      gdpr: `GDPR Compliance - ${info.name}`,
      default: `${capitalize(pageName)} - ${info.name}`
    },
    es: {
      terms: `Términos de Servicio - ${info.name}`,
      privacy: `Política de Privacidad - ${info.name}`,
      cookies: `Política de Cookies - ${info.name}`,
      gdpr: `Cumplimiento GDPR - ${info.name}`,
      default: `${capitalize(pageName)} - ${info.name}`
    }
  };

  const legalDescriptions = {
    en: `Read our ${pageName} policy. Last updated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.`,
    es: `Lee nuestra política de ${pageName}. Última actualización ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}.`
  };

  return {
    title: legalTitles[locale][pageName as keyof typeof legalTitles[typeof locale]] || legalTitles[locale].default,
    description: legalDescriptions[locale],
    keywords: [info.name.toLowerCase(), pageName, 'legal', 'policy']
  };
}

/**
 * Blog pages
 */
function generateBlogSEO(
  pageName: string,
  info: typeof projectConfig.business,
  keyword?: string,
  locale: 'en' | 'es' = 'en'
): GeneratedSEO {
  const titles = {
    en: `${capitalize(pageName)} - ${info.name} Blog`,
    es: `${capitalize(pageName)} - Blog de ${info.name}`
  };

  const descriptions = {
    en: `Read about ${pageName} and how ${info.name} helps ${info.target_personas[0]}. ${info.tagline}.`,
    es: `Lee sobre ${pageName} y cómo ${info.name} ayuda a ${translateToSpanish(info.target_personas[0])}. ${translateToSpanish(info.tagline)}.`
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: generateKeywords(info, pageName, keyword, ['blog', 'article', 'guide'])
  };
}

/**
 * Feature-specific pages (for/<persona>, alternative/<competitor>)
 */
function generateFeatureSEO(
  pageName: string,
  info: typeof projectConfig.business,
  keyword?: string,
  locale: 'en' | 'es' = 'en'
): GeneratedSEO {
  // Check if it's a "for" page (use case)
  if (pageName.includes('for/')) {
    const persona = pageName.split('/')[1];
    return {
      title: locale === 'en'
        ? `${info.name} for ${capitalize(persona)} - ${info.tagline}`
        : `${info.name} para ${capitalize(persona)} - ${translateToSpanish(info.tagline)}`,
      description: locale === 'en'
        ? `Discover how ${info.name} helps ${persona}. ${info.elevator_pitch}`
        : `Descubre cómo ${info.name} ayuda a ${persona}. ${translateToSpanish(info.elevator_pitch)}`,
      keywords: generateKeywords(info, persona, keyword, ['for', persona])
    };
  }

  // Check if it's an "alternative" page
  if (pageName.includes('alternative/')) {
    const competitor = pageName.split('/')[1];
    return {
      title: locale === 'en'
        ? `${info.name} - Best ${capitalize(competitor)} Alternative`
        : `${info.name} - La Mejor Alternativa a ${capitalize(competitor)}`,
      description: locale === 'en'
        ? `Looking for a ${competitor} alternative? ${info.name} offers ${info.unique_value}. Compare features and pricing.`
        : `¿Buscas una alternativa a ${competitor}? ${info.name} ofrece ${translateToSpanish(info.unique_value)}. Compara características y precios.`,
      keywords: [`${competitor} alternative`, `${competitor} vs ${info.name}`, ...generateKeywords(info, pageName, keyword)]
    };
  }

  return generateDefaultSEO(pageName, info, locale);
}

/**
 * Default/fallback SEO
 */
function generateDefaultSEO(
  pageName: string,
  info: typeof projectConfig.business,
  locale: 'en' | 'es' = 'en'
): GeneratedSEO {
  return {
    title: `${capitalize(pageName)} - ${info.name}`,
    description: locale === 'en'
      ? `${info.elevator_pitch} Learn more about ${pageName.toLowerCase()}.`
      : `${translateToSpanish(info.elevator_pitch)} Conoce más sobre ${pageName.toLowerCase()}.`,
    keywords: generateKeywords(info, pageName)
  };
}

/**
 * Generate relevant keywords based on context
 */
function generateKeywords(
  info: typeof projectConfig.business,
  pageName: string,
  customKeyword?: string,
  additionalKeywords: string[] = []
): string[] {
  const keywords = new Set<string>();

  // Add business name and industry
  keywords.add(info.name.toLowerCase());
  keywords.add(info.industry);

  // Add page name variations
  keywords.add(pageName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim());

  // Add custom keyword if provided
  if (customKeyword) {
    keywords.add(customKeyword.toLowerCase());
  }

  // Add target personas
  info.target_personas.forEach(persona => keywords.add(persona));

  // Add type-specific keywords
  if (info.type.includes('saas')) keywords.add('saas');
  if (info.type.includes('b2b')) keywords.add('b2b');
  if (info.type.includes('ai')) keywords.add('ai');

  // Add additional keywords
  additionalKeywords.forEach(kw => keywords.add(kw));

  // Add main feature keywords (first 2)
  info.core_features.slice(0, 2).forEach(feature => {
    keywords.add(feature.toLowerCase().split(' ')[0]);
  });

  return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
}

/**
 * Simple Spanish translation (to be replaced with proper i18n)
 * This is a placeholder - in production, use a proper translation service
 */
function translateToSpanish(text: string): string {
  // Basic translations for common terms
  const translations: Record<string, string> = {
    'startups': 'startups',
    'developers': 'desarrolladores',
    'agencies': 'agencias',
    'enterprises': 'empresas',
    'ship faster': 'lanza más rápido',
    'build faster': 'construye más rápido',
    'authentication': 'autenticación',
    'billing': 'facturación',
    'dashboard': 'panel',
    'the fastest way': 'la forma más rápida',
    'production-ready': 'listo para producción'
  };

  let translated = text.toLowerCase();
  Object.entries(translations).forEach(([en, es]) => {
    translated = translated.replace(new RegExp(en, 'gi'), es);
  });

  return capitalize(translated);
}

/**
 * Capitalize first letter of string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Batch generate SEO for common pages
 */
export function generateSEOForAllPages(): Record<string, GeneratedSEO> {
  const commonPages = [
    { name: 'home', type: 'marketing' as const },
    { name: 'pricing', type: 'marketing' as const },
    { name: 'features', type: 'marketing' as const },
    { name: 'about', type: 'marketing' as const },
    { name: 'contact', type: 'marketing' as const },
    { name: 'blog', type: 'blog' as const },
    { name: 'terms', type: 'legal' as const },
    { name: 'privacy', type: 'legal' as const },
    { name: 'cookies', type: 'legal' as const },
    { name: 'dashboard', type: 'app' as const },
    { name: 'settings', type: 'app' as const }
  ];

  const seo: Record<string, GeneratedSEO> = {};

  commonPages.forEach(({ name, type }) => {
    // Generate for both locales
    seo[`${name}_en`] = generateSEO({ pageName: name, pageType: type, locale: 'en' });
    seo[`${name}_es`] = generateSEO({ pageName: name, pageType: type, locale: 'es' });
  });

  return seo;
}