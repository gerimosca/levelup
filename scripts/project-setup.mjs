#!/usr/bin/env node

/**
 * Project Setup Script
 * One-time configuration for the entire project
 * Generates: project config, SEO, home content, brand, etc.
 *
 * Run with: npm run project:setup
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}→ ${msg}${colors.reset}`)
};

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const select = async (prompt, options) => {
  console.log(`\n${prompt}`);
  options.forEach((opt, idx) => {
    console.log(`  ${colors.cyan}${idx + 1}${colors.reset}) ${opt.label}`);
  });

  while (true) {
    const answer = await question(`\nSelect (1-${options.length}): `);
    const idx = parseInt(answer) - 1;
    if (idx >= 0 && idx < options.length) {
      return options[idx].value;
    }
    log.warn('Invalid selection. Please try again.');
  }
};

const multiSelect = async (prompt, options, min = 1, max = 5) => {
  console.log(`\n${prompt} (select ${min}-${max}, comma-separated)`);
  options.forEach((opt, idx) => {
    console.log(`  ${colors.cyan}${idx + 1}${colors.reset}) ${opt}`);
  });

  while (true) {
    const answer = await question(`\nSelect numbers (e.g., 1,3,5): `);
    const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
    const selected = indices.filter(i => i >= 0 && i < options.length).map(i => options[i]);

    if (selected.length >= min && selected.length <= max) {
      return selected;
    }
    log.warn(`Please select between ${min} and ${max} options.`);
  }
};

async function setupProject() {
  log.title('🚀 Project Setup - One-Time Configuration');
  log.info('This will configure your entire project in less than 2 minutes.');
  log.info('The information will be used to generate SEO, home content, and more.\n');

  const config = {
    business: {},
    preferences: {}
  };

  // Step 1: Basic Info
  log.step('Basic Information');

  config.business.name = await question('Business/Product name: ');
  if (!config.business.name) {
    log.error('Business name is required');
    process.exit(1);
  }

  config.business.domain = await question(`Domain (e.g., ${config.business.name.toLowerCase().replace(/\s+/g, '')}.com): `);
  if (!config.business.domain) {
    config.business.domain = `${config.business.name.toLowerCase().replace(/\s+/g, '')}.com`;
  }

  // Step 2: Business Type
  log.step('Business Type');

  config.business.type = await select('What type of product are you building?', [
    { label: 'B2B SaaS (for businesses)', value: 'b2b-saas' },
    { label: 'B2C SaaS (for consumers)', value: 'b2c-saas' },
    { label: 'Developer Tool', value: 'dev-tool' },
    { label: 'AI Product', value: 'ai-product' },
    { label: 'Marketplace', value: 'marketplace' },
    { label: 'Other', value: 'other' }
  ]);

  // Industry
  const industries = [
    'productivity', 'fintech', 'healthtech', 'edtech', 'marketing',
    'sales', 'hr-tech', 'logistics', 'real-estate', 'e-commerce',
    'analytics', 'security', 'developer-tools', 'ai-ml', 'other'
  ];

  config.business.industry = await select('Industry/Category:', industries.map(i => ({
    label: i.charAt(0).toUpperCase() + i.slice(1).replace('-', ' '),
    value: i
  })));

  // Step 3: Core Messaging (CRITICAL)
  log.step('Core Messaging (this is important!)');

  console.log('\n💡 Tip: Keep it short and benefit-focused');
  config.business.tagline = await question('Tagline (3-5 words, e.g., "Ship 10x Faster"): ');
  if (!config.business.tagline) {
    config.business.tagline = 'Build Better Products';
  }

  console.log('\n💡 Tip: One sentence that explains what you do and for whom');
  config.business.elevator_pitch = await question('Elevator pitch (one sentence): ');
  if (!config.business.elevator_pitch) {
    log.error('Elevator pitch is required for SEO generation');
    process.exit(1);
  }

  // Step 4: Features (for home page)
  log.step('Core Features');

  console.log('\n💡 List your 3-5 main features/benefits (one per line, empty line to finish):');
  const features = [];
  for (let i = 1; i <= 5; i++) {
    const feature = await question(`Feature ${i}: `);
    if (!feature) break;
    features.push(feature);
  }

  if (features.length < 3) {
    // Provide defaults based on type
    log.info('Using default features for your product type');
    if (config.business.type.includes('saas')) {
      features.push('User Authentication', 'Billing & Subscriptions', 'Admin Dashboard');
    } else {
      features.push('Fast Performance', 'Easy Integration', 'Great Support');
    }
  }
  config.business.core_features = features;

  // Step 5: Target Market
  log.step('Target Audience');

  const personas = [
    'startups', 'enterprises', 'developers', 'designers', 'marketers',
    'agencies', 'freelancers', 'small-businesses', 'creators', 'students'
  ];

  config.business.target_personas = await multiSelect(
    'Who is your target audience?',
    personas,
    1, 3
  );

  console.log('\n💡 Describe your ideal customer in one sentence');
  config.business.ideal_customer = await question('Ideal customer (e.g., "SaaS founders who want to ship fast"): ');
  if (!config.business.ideal_customer) {
    config.business.ideal_customer = `${config.business.target_personas[0]} building ${config.business.industry} products`;
  }

  // Step 6: Positioning
  log.step('Market Positioning');

  config.business.main_competitor = await question('Main competitor (optional, for comparison pages): ');

  console.log('\n💡 What makes you different from competitors?');
  config.business.unique_value = await question('Unique value proposition: ');
  if (!config.business.unique_value) {
    config.business.unique_value = `The fastest way to ${config.business.tagline.toLowerCase()}`;
  }

  // Step 7: Pricing
  log.step('Pricing Model');

  config.business.pricing_model = await select('Pricing model:', [
    { label: 'Freemium (free tier + paid)', value: 'freemium' },
    { label: 'Free Trial then Paid', value: 'trial' },
    { label: 'Paid Only', value: 'paid-only' },
    { label: 'Usage-Based', value: 'usage-based' }
  ]);

  if (config.business.pricing_model !== 'freemium') {
    const price = await question('Starting price in USD (e.g., 29): ');
    config.business.starting_price = parseInt(price) || 29;
  }

  // Step 8: Preferences
  log.step('Generation Preferences');

  config.preferences.content_tone = await select('Content tone:', [
    { label: 'Professional', value: 'professional' },
    { label: 'Casual & Friendly', value: 'casual' },
    { label: 'Playful & Fun', value: 'playful' },
    { label: 'Technical', value: 'technical' }
  ]);

  config.preferences.cta_style = await select('Call-to-action style:', [
    { label: 'Direct (Get Started, Sign Up)', value: 'direct' },
    { label: 'Benefit-focused (Start Saving Time)', value: 'benefit-focused' },
    { label: 'Urgency (Start Today, Limited Time)', value: 'urgency' }
  ]);

  config.preferences.auto_translate = true; // Default to true

  // Generate the configuration file
  log.step('Generating Configuration Files...');

  // 1. Generate project.config.ts
  const configContent = `/**
 * Project Configuration
 * Generated by project:setup on ${new Date().toISOString()}
 *
 * This is your single source of truth for all project information.
 * Edit this file to update SEO, home content, and other auto-generated content.
 */

import type { ProjectConfig } from './project.config';

export const projectConfig: ProjectConfig = ${JSON.stringify(config, null, 2)};

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
    titleTemplate: \`%s | \${name}\`,
    defaultTitle: \`\${name} - \${tagline}\`,
    defaultDescription: elevator_pitch,
    keywords: []
  };
}`;

  const configPath = join(rootDir, 'src/core/shared/config/project.config.generated.ts');
  writeFileSync(configPath, configContent);
  log.success('Generated project.config.generated.ts');

  // 2. Update brand.ts
  const brandPath = join(rootDir, 'src/core/shared/config/brand.ts');
  if (existsSync(brandPath)) {
    let brandContent = readFileSync(brandPath, 'utf-8');

    // Update brand values based on config
    brandContent = brandContent.replace(/name: '.*?'/g, `name: '${config.business.name}'`);
    brandContent = brandContent.replace(/website: '.*?'/g, `website: 'https://${config.business.domain}'`);
    brandContent = brandContent.replace(/defaultTitle: '.*?'/g, `defaultTitle: '${config.business.name} - ${config.business.tagline}'`);
    brandContent = brandContent.replace(/defaultDescription: '.*?'/g, `defaultDescription: '${config.business.elevator_pitch}'`);

    writeFileSync(brandPath, brandContent);
    log.success('Updated brand.ts');
  }

  // 3. Generate SEO for all pages
  log.step('Generating SEO Metadata...');

  // This would normally call the SEO generator, but for now we'll create a simple version
  const seoPages = ['home', 'pricing', 'features', 'about', 'contact'];
  const seoData = {
    en: {},
    es: {}
  };

  seoPages.forEach(page => {
    // Simplified SEO generation
    seoData.en[page] = {
      title: page === 'home'
        ? `${config.business.name} - ${config.business.tagline}`
        : `${page.charAt(0).toUpperCase() + page.slice(1)} - ${config.business.name}`,
      description: `${config.business.elevator_pitch} ${page === 'home' ? '' : `Learn more about our ${page}.`}`
    };

    // Auto-translate to Spanish (simplified)
    seoData.es[page] = {
      title: page === 'home'
        ? `${config.business.name} - ${config.business.tagline}`
        : `${translatePageName(page)} - ${config.business.name}`,
      description: `${config.business.elevator_pitch} ${page === 'home' ? '' : `Conoce más sobre ${translatePageName(page).toLowerCase()}.`}`
    };
  });

  // Update messages files
  ['en', 'es'].forEach(locale => {
    const messagesPath = join(rootDir, `messages/${locale}.json`);
    if (existsSync(messagesPath)) {
      const messages = JSON.parse(readFileSync(messagesPath, 'utf-8'));

      // Add/update SEO section
      if (!messages.seo) messages.seo = {};
      Object.assign(messages.seo, seoData[locale]);

      writeFileSync(messagesPath, JSON.stringify(messages, null, 2) + '\n');
      log.success(`Updated messages/${locale}.json with SEO`);
    }
  });

  // Summary
  console.log('\n');
  log.title('✨ Setup Complete!');

  console.log('\n📝 Configuration Summary:');
  console.log(`  • Business: ${colors.bright}${config.business.name}${colors.reset}`);
  console.log(`  • Type: ${config.business.type}`);
  console.log(`  • Industry: ${config.business.industry}`);
  console.log(`  • Target: ${config.business.target_personas.join(', ')}`);
  console.log(`  • Features: ${config.business.core_features.length} core features`);

  console.log('\n✅ Generated:');
  console.log('  • Project configuration (project.config.generated.ts)');
  console.log('  • SEO metadata for all pages');
  console.log('  • Updated brand configuration');
  console.log('  • Translations (en/es)');

  console.log('\n🚀 Next Steps:');
  console.log(`  1. Review ${colors.cyan}src/core/shared/config/project.config.generated.ts${colors.reset}`);
  console.log(`  2. Run ${colors.cyan}npm run dev${colors.reset} to see your changes`);
  console.log(`  3. Generate home content: ${colors.cyan}npm run home:generate${colors.reset}`);
  console.log(`  4. Customize as needed`);

  console.log('\n💡 Tips:');
  console.log('  • You can re-run this anytime to update configuration');
  console.log('  • All generated content can be manually edited');
  console.log('  • SEO and content use this config as single source of truth');

  rl.close();
}

function translatePageName(page) {
  const translations = {
    'home': 'Inicio',
    'pricing': 'Precios',
    'features': 'Características',
    'about': 'Acerca de',
    'contact': 'Contacto',
    'blog': 'Blog',
    'terms': 'Términos',
    'privacy': 'Privacidad'
  };
  return translations[page.toLowerCase()] || page;
}

// Run the setup
setupProject().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});