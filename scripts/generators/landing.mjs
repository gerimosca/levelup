#!/usr/bin/env node

/**
 * Landing Page Copy Adapter
 * Run with: node scripts/generators/landing.mjs
 *
 * Adapts landing page copy to your specific business
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}→ ${msg}${colors.reset}`),
  title: (msg) =>
    console.log(
      `\n${colors.bright}${colors.blue}${'='.repeat(50)}\n  ${msg}\n${'='.repeat(50)}${colors.reset}\n`
    ),
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

/**
 * Get brand name from brand.ts
 */
function getBrandName() {
  const brandPath = join(rootDir, 'src/core/shared/config/brand.ts');
  const brandContent = readFileSync(brandPath, 'utf-8');

  const match = brandContent.match(/name: ['"](.+?)['"]/);
  return match ? match[1] : 'AI SaaS';
}

/**
 * Use AI to adapt landing copy
 */
async function adaptCopyWithAI(businessDescription, problemSolved, benefits, brandName) {
  try {
    log.info('Asking Claude to adapt your landing copy...');

    const prompt = `You are a conversion copywriter. Adapt landing page copy for this SaaS business.

Brand: ${brandName}
Business: ${businessDescription}
Problem solved: ${problemSolved}
Key benefits: ${benefits.join(', ')}

Return ONLY a JSON object (no markdown, no explanation) with these keys:
{
  "heroTitle": "Main hero title (benefit-focused, 4-8 words)",
  "heroSubtitle": "Hero subtitle explaining what it does (max 120 chars)",
  "featuresTitle": "Features section title (5-8 words)",
  "featuresDescription": "Features section description (max 100 chars)",
  "cta": "Primary CTA button text (2-3 words, action-oriented)"
}

Make it benefit-focused, not feature-focused. Use active voice.`;

    const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      cwd: rootDir,
      timeout: 30000,
    });

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const adapted = JSON.parse(jsonMatch[0]);
      return adapted;
    }

    return null;
  } catch (error) {
    log.warn('Could not get AI adaptation');
    return null;
  }
}

/**
 * Update translations
 */
function updateTranslations(lang, updates) {
  const translationsPath = join(rootDir, `messages/${lang}.json`);
  const translations = JSON.parse(readFileSync(translationsPath, 'utf-8'));

  // Update hero
  if (updates.heroTitle) {
    // Split into parts for existing structure (titleStart, titleHighlight, titleEnd)
    // For now, just update subtitle
    translations.landing.hero.subtitle = updates.heroSubtitle;
  }

  // Update features
  if (updates.featuresTitle) {
    translations.landing.features.title = updates.featuresTitle;
  }
  if (updates.featuresDescription) {
    translations.landing.features.description = updates.featuresDescription;
  }

  // Update CTA
  if (updates.cta) {
    translations.landing.hero.cta = updates.cta;
  }

  writeFileSync(translationsPath, JSON.stringify(translations, null, 2) + '\n');
  log.success(`${lang}.json updated`);
}

async function main() {
  log.title('Adapt Landing Page Copy');

  const brandName = getBrandName();
  log.info(`Brand: ${colors.bright}${brandName}${colors.reset}`);
  console.log('');

  log.info('This will adapt your landing page copy to your specific business.');
  console.log('Answer a few quick questions to generate benefit-focused copy.\n');

  // Step 1: Gather information
  log.step('Tell us about your business');
  console.log('');

  const businessDescription = await question(
    'Describe your SaaS in 1-2 sentences:\n> '
  );

  if (!businessDescription) {
    log.warn('No description provided. Exiting.');
    rl.close();
    return;
  }

  const problemSolved = await question(
    '\nWhat main problem does it solve?\n> '
  );

  const benefitsInput = await question(
    '\nList 3 key benefits (separated by commas):\n> '
  );

  const benefits = benefitsInput
    .split(',')
    .map((b) => b.trim())
    .filter((b) => b);

  if (benefits.length === 0) {
    log.warn('No benefits provided. Using defaults.');
  }

  // Step 2: Use AI or manual
  console.log('\n');
  const useAI = await question(
    'Use AI to generate copy? (requires Claude Code) [Y/n]: '
  );

  let updates = {};

  if (!useAI || useAI.toLowerCase() === 'y' || useAI.toLowerCase() === 'yes') {
    // AI adaptation
    const aiCopy = await adaptCopyWithAI(
      businessDescription,
      problemSolved,
      benefits,
      brandName
    );

    if (aiCopy) {
      console.log('\n');
      log.success('AI generated copy:');
      console.log('');
      console.log(`  Hero title: ${aiCopy.heroTitle}`);
      console.log(`  Hero subtitle: ${aiCopy.heroSubtitle}`);
      console.log(`  Features title: ${aiCopy.featuresTitle}`);
      console.log(`  Features description: ${aiCopy.featuresDescription}`);
      console.log(`  CTA: ${aiCopy.cta}`);
      console.log('');

      const accept = await question('Use this copy? [Y/n]: ');
      if (!accept || accept.toLowerCase() === 'y' || accept.toLowerCase() === 'yes') {
        updates = aiCopy;
      } else {
        log.info('Copy not applied. You can edit manually in messages/*.json');
        rl.close();
        return;
      }
    } else {
      log.warn('AI generation failed. Skipping.');
      rl.close();
      return;
    }
  } else {
    log.info('Manual editing: Please edit messages/en.json and messages/es.json directly.');
    rl.close();
    return;
  }

  // Step 3: Update translations (English only for now)
  if (Object.keys(updates).length > 0) {
    console.log('\n');
    log.step('Updating translations...');

    updateTranslations('en', updates);

    log.warn('Spanish translations not auto-generated.');
    log.info('Please translate manually in messages/es.json');
  }

  // Done
  console.log('\n');
  log.success('Landing page copy adapted!');
  console.log('');
  log.info('Next steps:');
  console.log('  1. Review changes in messages/en.json');
  console.log('  2. Translate to Spanish in messages/es.json');
  console.log('  3. Restart dev server to see changes (npm run dev)');
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
