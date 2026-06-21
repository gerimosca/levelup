#!/usr/bin/env node

/**
 * Legal Pages Customizer
 * Run with: node scripts/generators/legal.mjs
 *
 * Customizes Privacy Policy and Terms with real company data
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
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

const confirm = async (prompt) => {
  const answer = await question(prompt);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

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
 * Update translations with company info
 */
function updateTranslations(lang, companyData) {
  const translationsPath = join(rootDir, `messages/${lang}.json`);
  let content = readFileSync(translationsPath, 'utf-8');

  // Parse JSON
  const translations = JSON.parse(content);

  // Replace {companyName} placeholder
  const jsonString = JSON.stringify(translations, null, 2);
  const updated = jsonString.replace(/\{companyName\}/g, companyData.legalName);
  const updatedTranslations = JSON.parse(updated);

  // Update contact information in Privacy Policy
  if (updatedTranslations.pages?.privacy?.sections?.contact) {
    updatedTranslations.pages.privacy.sections.contact.email = companyData.email;
    updatedTranslations.pages.privacy.sections.contact.dpo = companyData.dpoEmail;
  }

  // Update contact information in Terms
  if (updatedTranslations.pages?.terms?.sections?.contact) {
    updatedTranslations.pages.terms.sections.contact.email = companyData.email;
  }

  // Add company info section to Privacy (for GDPR compliance)
  if (updatedTranslations.pages?.privacy?.sections) {
    updatedTranslations.pages.privacy.sections.companyInfo = {
      title: 'Data Controller',
      legalName: companyData.legalName,
      address: companyData.address,
      country: companyData.country,
      email: companyData.email,
      dpo: companyData.dpoEmail,
    };
  }

  writeFileSync(translationsPath, JSON.stringify(updatedTranslations, null, 2) + '\n');
  log.success(`${lang}.json updated`);
}

async function main() {
  log.title('Customize Legal Pages');

  const brandName = getBrandName();

  log.info('This will customize your Terms of Service with real company data.');
  log.info('For Privacy & Cookie policies, we recommend using Iubenda in production.');
  console.log('');

  // Step 1: Gather company information
  log.step('Company Information');
  console.log('');

  const legalName =
    (await question(`Legal company name [${brandName}]: `)) || brandName;

  const address = await question(
    'Company address (street, city, postal code):\n> '
  );

  const country = await question('Country of operation: ');

  const email =
    (await question('Legal contact email: ')) ||
    `legal@${brandName.toLowerCase().replace(/\s+/g, '')}.com`;

  const dpoEmail =
    (await question(
      `Data Protection Officer (DPO) email [${email}]: `
    )) || email;

  // Step 2: Jurisdiction & Compliance
  console.log('');
  log.step('Jurisdiction & Compliance');
  console.log('');
  log.info('This helps us provide relevant compliance information in your Terms.');
  console.log('');

  const operatesInEU = await confirm(
    'Do you operate in the European Union (GDPR applies)? [y/N]: '
  );
  const operatesInCalifornia = await confirm(
    'Do you operate in California (CCPA applies)? [y/N]: '
  );

  // Step 3: Services Used (for Terms context)
  console.log('');
  log.step('Third-Party Services');
  console.log('');
  log.info('These will be mentioned in your Terms of Service.');
  console.log('');

  const usesAnalytics = await confirm(
    'Do you use analytics (Google Analytics, Plausible, etc.)? [y/N]: '
  );
  const usesEmailMarketing = await confirm(
    'Do you use email marketing (Mailchimp, etc.)? [y/N]: '
  );
  const usesErrorTracking = await confirm(
    'Do you use error tracking (Sentry, etc.)? [y/N]: '
  );

  const companyData = {
    legalName,
    address,
    country,
    email,
    dpoEmail,
    operatesInEU,
    operatesInCalifornia,
    usesAnalytics,
    usesEmailMarketing,
    usesErrorTracking,
  };

  // Step 4: Review
  console.log('\n');
  log.step('Review your information:');
  console.log('');
  console.log(`  Legal name: ${legalName}`);
  console.log(`  Address: ${address}`);
  console.log(`  Country: ${country}`);
  console.log(`  Contact email: ${email}`);
  console.log(`  DPO email: ${dpoEmail}`);
  console.log(`  GDPR (EU): ${operatesInEU ? 'Yes' : 'No'}`);
  console.log(`  CCPA (California): ${operatesInCalifornia ? 'Yes' : 'No'}`);
  console.log('');

  const confirmData = await confirm('Is this correct? [Y/n]: ');

  if (!confirmData) {
    log.info('Cancelled. Run the script again to retry.');
    rl.close();
    return;
  }

  // Step 3: Update translations
  console.log('\n');
  log.step('Updating legal pages...');

  updateTranslations('en', companyData);
  updateTranslations('es', companyData);

  // Done
  console.log('\n');
  log.success('Legal pages customized successfully!');
  console.log('');
  log.warn('⚠️  BEFORE PRODUCTION:');
  console.log('');
  console.log('  📄 Terms of Service:');
  console.log('     ✓ Generated with your data');
  console.log('     → Review with a lawyer before launch');
  console.log('');
  console.log('  🔒 Privacy & Cookie Policies:');
  console.log('     ⚠️  Basic templates included (development only)');
  console.log('     → Configure Iubenda for production (recommended)');
  console.log('     → Cost: €27/year for GDPR + CCPA compliance');
  console.log('     → https://iubenda.com');
  console.log('');
  console.log('  🌍 Compliance:');
  if (operatesInEU) {
    console.log('     → GDPR (EU): Iubenda auto-updates for regulation changes');
  }
  if (operatesInCalifornia) {
    console.log('     → CCPA (California): Iubenda handles compliance');
  }
  console.log('');
  log.info('Production setup:');
  console.log('  1. Create Iubenda account');
  console.log('  2. Generate Privacy + Cookie policies');
  console.log('  3. Add to .env.local:');
  console.log('     NEXT_PUBLIC_IUBENDA_PRIVACY_URL=https://...');
  console.log('     NEXT_PUBLIC_IUBENDA_COOKIE_URL=https://...');
  console.log('  4. Pages will auto-switch to Iubenda content');
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
