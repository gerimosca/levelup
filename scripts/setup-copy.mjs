#!/usr/bin/env node

/**
 * Landing Pages Copy Setup
 * Interactive wizard to adapt all landing page copy with AI
 *
 * Updated for new i18n architecture:
 * - Home: Updates src/core/features/home/config/editable-content.json
 * - About/Pricing: Updates src/app/[locale]/(landing)/*/copies/*.json
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  generateHomeCopy,
  generateAboutCopy,
  generatePricingCopy,
  translateToSpanish,
} from './lib/ai-copy-generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = process.cwd();

// Paths
const PATHS = {
  brand: join(PROJECT_ROOT, 'src/core/shared/config/brand.ts'),
  homeEditableContent: join(PROJECT_ROOT, 'src/core/features/home/config/editable-content.json'),
  aboutCopies: join(PROJECT_ROOT, 'src/app/[locale]/(landing)/about/copies'),
  pricingCopies: join(PROJECT_ROOT, 'src/app/[locale]/(landing)/pricing/copies'),
};

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  title: (msg) =>
    console.log(
      `\n${colors.bright}${colors.blue}${'━'.repeat(60)}\n${msg}\n${'━'.repeat(60)}${colors.reset}\n`
    ),
  separator: () => console.log(`\n${colors.gray}${'━'.repeat(60)}${colors.reset}\n`),
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

/**
 * Get brand info from brand.ts
 */
function getBrandInfo() {
  const brandContent = readFileSync(PATHS.brand, 'utf-8');

  const nameMatch = brandContent.match(/name:\s*['"](.+?)['"]/);
  const taglineMatch = brandContent.match(/tagline:\s*['"](.+?)['"]/);

  return {
    name: nameMatch ? nameMatch[1] : 'AI SaaS',
    tagline: taglineMatch ? taglineMatch[1] : 'Build faster with AI',
  };
}

/**
 * Update Home editable-content.json with new translations
 */
function updateHomeContent(enCopy, esCopy) {
  // Read existing editable content
  let editable = {};
  if (existsSync(PATHS.homeEditableContent)) {
    editable = JSON.parse(readFileSync(PATHS.homeEditableContent, 'utf-8'));
  }

  // Update hero section
  if (enCopy.hero) {
    if (!editable.hero) editable.hero = {};

    if (enCopy.hero.badge) {
      editable.hero.badge = { en: enCopy.hero.badge, es: esCopy.hero?.badge || enCopy.hero.badge };
    }
    if (enCopy.hero.headline) {
      editable.hero.headline = { en: enCopy.hero.headline, es: esCopy.hero?.headline || enCopy.hero.headline };
    }
    if (enCopy.hero.headlineHighlight) {
      editable.hero.headlineHighlight = { en: enCopy.hero.headlineHighlight, es: esCopy.hero?.headlineHighlight || enCopy.hero.headlineHighlight };
    }
    if (enCopy.hero.subheadline) {
      editable.hero.subheadline = { en: enCopy.hero.subheadline, es: esCopy.hero?.subheadline || enCopy.hero.subheadline };
    }
    if (enCopy.hero.ctaPrimary) {
      editable.hero.ctaPrimary = { en: enCopy.hero.ctaPrimary, es: esCopy.hero?.ctaPrimary || enCopy.hero.ctaPrimary };
    }
    if (enCopy.hero.ctaSecondary) {
      editable.hero.ctaSecondary = { en: enCopy.hero.ctaSecondary, es: esCopy.hero?.ctaSecondary || enCopy.hero.ctaSecondary };
    }
    if (enCopy.hero.socialProofText) {
      editable.hero.socialProofText = { en: enCopy.hero.socialProofText, es: esCopy.hero?.socialProofText || enCopy.hero.socialProofText };
    }
  }

  // Update features section
  if (enCopy.features) {
    if (!editable.features) editable.features = {};

    if (enCopy.features.headline) {
      editable.features.headline = { en: enCopy.features.headline, es: esCopy.features?.headline || enCopy.features.headline };
    }
    if (enCopy.features.subheadline) {
      editable.features.subheadline = { en: enCopy.features.subheadline, es: esCopy.features?.subheadline || enCopy.features.subheadline };
    }
  }

  // Update pricing section
  if (enCopy.pricing) {
    if (!editable.pricing) editable.pricing = {};

    if (enCopy.pricing.headline) {
      editable.pricing.headline = { en: enCopy.pricing.headline, es: esCopy.pricing?.headline || enCopy.pricing.headline };
    }
    if (enCopy.pricing.subheadline) {
      editable.pricing.subheadline = { en: enCopy.pricing.subheadline, es: esCopy.pricing?.subheadline || enCopy.pricing.subheadline };
    }
    if (enCopy.pricing.badge) {
      editable.pricing.badge = { en: enCopy.pricing.badge, es: esCopy.pricing?.badge || enCopy.pricing.badge };
    }
  }

  // Update cta section
  if (enCopy.cta) {
    if (!editable.cta) editable.cta = {};

    if (enCopy.cta.headline) {
      editable.cta.headline = { en: enCopy.cta.headline, es: esCopy.cta?.headline || enCopy.cta.headline };
    }
    if (enCopy.cta.subheadline) {
      editable.cta.subheadline = { en: enCopy.cta.subheadline, es: esCopy.cta?.subheadline || enCopy.cta.subheadline };
    }
    if (enCopy.cta.ctaPrimary) {
      editable.cta.ctaPrimary = { en: enCopy.cta.ctaPrimary, es: esCopy.cta?.ctaPrimary || enCopy.cta.ctaPrimary };
    }
    if (enCopy.cta.ctaSecondary) {
      editable.cta.ctaSecondary = { en: enCopy.cta.ctaSecondary, es: esCopy.cta?.ctaSecondary || enCopy.cta.ctaSecondary };
    }
  }

  writeFileSync(PATHS.homeEditableContent, JSON.stringify(editable, null, 2) + '\n');
  log.success('Home editable-content.json updated');
}

/**
 * Update About/Pricing copies (co-located JSON files)
 */
function updateCopiesFiles(basePath, enCopy, esCopy) {
  // Ensure directory exists
  if (!existsSync(basePath)) {
    mkdirSync(basePath, { recursive: true });
  }

  const enPath = join(basePath, 'en.json');
  const esPath = join(basePath, 'es.json');

  // Read existing files or start fresh
  let existingEn = {};
  let existingEs = {};

  if (existsSync(enPath)) {
    existingEn = JSON.parse(readFileSync(enPath, 'utf-8'));
  }
  if (existsSync(esPath)) {
    existingEs = JSON.parse(readFileSync(esPath, 'utf-8'));
  }

  // Deep merge
  const mergedEn = deepMerge(existingEn, enCopy);
  const mergedEs = deepMerge(existingEs, esCopy);

  writeFileSync(enPath, JSON.stringify(mergedEn, null, 2) + '\n');
  writeFileSync(esPath, JSON.stringify(mergedEs, null, 2) + '\n');

  log.success(`${basePath.split('/').pop()} copies updated (en.json, es.json)`);
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Run i18n:generate-static to regenerate static files
 */
async function regenerateStaticI18n() {
  const { execSync } = await import('child_process');
  log.info('Regenerating static i18n files...');
  try {
    execSync('npm run i18n:generate-static', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    log.success('Static i18n files regenerated');
    return true;
  } catch (error) {
    log.warn('Could not regenerate i18n files. Run: npm run i18n:generate-static');
    return false;
  }
}

/**
 * Main wizard
 */
async function main() {
  log.title('🎨 Landing Pages Copy Setup (v2)');

  // Check brand config
  if (!existsSync(PATHS.brand)) {
    log.error('Brand configuration not found. Run brand setup first.');
    rl.close();
    process.exit(1);
  }

  // Get brand info
  const brand = getBrandInfo();
  log.info(`Brand: ${colors.bright}${brand.name}${colors.reset}`);
  log.info(`Tagline: ${colors.gray}${brand.tagline}${colors.reset}`);

  console.log('');
  log.info('📊 Pages to adapt:');
  console.log(`   • Home (editable-content.json - hero, features, pricing, cta)`);
  console.log(`   • About (copies/en.json, copies/es.json)`);
  console.log(`   • Pricing (copies/en.json, copies/es.json)`);

  log.separator();

  // ===== HOME PAGE =====
  log.step('🏠 HOME PAGE');
  console.log('');
  console.log('What does your SaaS do and what problem does it solve?');
  console.log('');
  console.log(`${colors.gray}Answer in 2-3 sentences:`);
  console.log('• Core functionality');
  console.log('• Target audience');
  console.log('• Main benefit');
  console.log('');
  console.log('Example: "We help marketing teams automate social media');
  console.log('posting. Our AI creates engaging content and schedules');
  console.log(`posts across platforms. Saves 10 hours/week."${colors.reset}`);
  console.log('');

  const homeAnswer = await question('> ');

  if (!homeAnswer) {
    log.warn('No answer provided. Skipping home page.');
  } else {
    console.log('');
    log.info('Generating home page copy with AI...');

    try {
      const homeCopyEn = await generateHomeCopy(brand.name, brand.tagline, homeAnswer);

      // Translate to Spanish
      log.info('Translating to Spanish...');
      const homeCopyEs = await translateToSpanish(homeCopyEn, 'home');

      updateHomeContent(homeCopyEn, homeCopyEs);
    } catch (error) {
      log.warn(`Failed to generate home copy: ${error.message}`);
    }
  }

  log.separator();

  // ===== ABOUT PAGE =====
  log.step('📖 ABOUT PAGE');
  console.log('');
  console.log("Why did you create this SaaS? What's your story?");
  console.log('');
  console.log(`${colors.gray}Answer in 2-3 sentences:`);
  console.log('• Origin story or motivation');
  console.log('• Your mission');
  console.log('• What drives you');
  console.log('');
  console.log('Example: "After spending years doing manual social media');
  console.log('work, we knew there had to be a better way. We built this');
  console.log(`to give time back to marketers for strategy, not busywork."${colors.reset}`);
  console.log('');

  const aboutAnswer = await question('> ');

  if (!aboutAnswer) {
    log.warn('No answer provided. Skipping about page.');
  } else {
    console.log('');
    log.info('Generating about page copy with AI...');

    try {
      const aboutCopyEn = await generateAboutCopy(brand.name, aboutAnswer);

      log.info('Translating to Spanish...');
      const aboutCopyEs = await translateToSpanish(aboutCopyEn, 'about');

      updateCopiesFiles(PATHS.aboutCopies, aboutCopyEn, aboutCopyEs);
    } catch (error) {
      log.warn(`Failed to generate about copy: ${error.message}`);
    }
  }

  log.separator();

  // ===== PRICING PAGE =====
  log.step('💰 PRICING PAGE');
  console.log('');
  console.log('How would you describe your pricing approach?');
  console.log('');
  console.log(`${colors.gray}Answer in 1 sentence:`);
  console.log('• Pricing philosophy or key message');
  console.log('');
  console.log('Example: "Simple, transparent pricing that grows with your');
  console.log(`team. Start free, upgrade when you're ready."${colors.reset}`);
  console.log('');

  const pricingAnswer = await question('> ');

  if (!pricingAnswer) {
    log.warn('No answer provided. Skipping pricing page.');
  } else {
    console.log('');
    log.info('Generating pricing page copy with AI...');

    try {
      const pricingCopyEn = await generatePricingCopy(brand.name, pricingAnswer);

      log.info('Translating to Spanish...');
      const pricingCopyEs = await translateToSpanish(pricingCopyEn, 'pricing');

      updateCopiesFiles(PATHS.pricingCopies, pricingCopyEn, pricingCopyEs);
    } catch (error) {
      log.warn(`Failed to generate pricing copy: ${error.message}`);
    }
  }

  log.separator();

  // ===== FINALIZE =====
  log.step('🤖 Finalizing...');

  // Regenerate static i18n files
  await regenerateStaticI18n();

  log.separator();

  // Done
  log.success('All landing pages adapted!');
  console.log('');
  log.info('Next steps:');
  console.log('  1. Restart dev server: npm run dev');
  console.log('  2. Review pages in browser');
  console.log('  3. Fine-tune in:');
  console.log('     - Home: src/core/features/home/config/editable-content.json');
  console.log('     - About: src/app/[locale]/(landing)/about/copies/');
  console.log('     - Pricing: src/app/[locale]/(landing)/pricing/copies/');
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
