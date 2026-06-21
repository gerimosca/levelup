#!/usr/bin/env node

/**
 * Brand Assets Generator
 * Run with: node scripts/generators/assets.mjs
 *
 * Generates placeholder assets (logo, icon) based on brand name
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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
 * Get initials from brand name
 */
function getInitials(name) {
  const words = name.split(/\s+/);
  if (words.length === 1) {
    // Single word: take first 2 chars
    return name.substring(0, 2).toUpperCase();
  }
  // Multiple words: take first char of each (max 2)
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Generate logo SVG
 */
function generateLogoSVG(brandName) {
  return `<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="40" rx="8" fill="currentColor" fill-opacity="0.1"/>
  <text x="60" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="currentColor" text-anchor="middle">
    ${brandName}
  </text>
</svg>
`;
}

/**
 * Generate icon SVG
 */
function generateIconSVG(initials) {
  return `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="currentColor" fill-opacity="0.1"/>
  <circle cx="256" cy="256" r="120" fill="currentColor" fill-opacity="0.2"/>
  <text x="256" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="80" font-weight="700" fill="currentColor" text-anchor="middle">
    ${initials}
  </text>
</svg>
`;
}

async function main() {
  log.title('Configure Brand Assets');

  const brandName = getBrandName();
  log.info(`Current brand name: ${colors.bright}${brandName}${colors.reset}`);
  console.log('');

  // Step 1: Choose method
  console.log('How would you like to configure your brand assets?\n');
  console.log('  [1] Generate simple SVG placeholders (recommended for now)');
  console.log('  [2] I have my own files (manual upload)');
  console.log('  [3] Keep current placeholders');
  console.log('');

  const choice = await question('Select option [1-3]: ');

  if (choice === '1') {
    // Generate SVG placeholders
    console.log('\n');
    log.step('Generating SVG placeholders...');

    const initials = getInitials(brandName);
    log.info(`Using initials: ${initials}`);

    // Generate logo
    const logoSVG = generateLogoSVG(brandName);
    const logoPath = join(rootDir, 'public/logo.svg');
    writeFileSync(logoPath, logoSVG);
    log.success('logo.svg generated');

    // Generate icon
    const iconSVG = generateIconSVG(initials);
    const iconPath = join(rootDir, 'public/icon.svg');
    writeFileSync(iconPath, iconSVG);
    log.success('icon.svg generated');

    console.log('\n');
    log.warn('Still needed:');
    console.log('');
    console.log('  1. favicon.ico (16x16 or 32x32 icon)');
    console.log('     → Use https://realfavicongenerator.net/');
    console.log('     → Upload icon.svg and generate favicon');
    console.log('     → Download and place in /public/favicon.ico');
    console.log('');
    console.log('  2. og-image.png (1200x630 for social sharing)');
    console.log('     → Use https://www.canva.com/ (free)');
    console.log('     → Create 1200x630px image with your brand');
    console.log('     → Export as PNG and place in /public/og-image.png');
    console.log('');
  } else if (choice === '2') {
    // Manual upload instructions
    console.log('\n');
    log.step('Manual Upload Instructions');
    console.log('');
    log.info('Place your files in the /public/ directory:');
    console.log('');
    console.log('  1. logo.svg - Your logo (SVG recommended, ~120x40px)');
    console.log('  2. icon.svg - Square icon (SVG, 512x512px or similar)');
    console.log('  3. favicon.ico - Browser favicon (16x16 or 32x32px)');
    console.log('  4. og-image.png - Social sharing image (1200x630px)');
    console.log('');
    log.warn('After placing your files, run npm run dev to see them.');
    console.log('');
  } else if (choice === '3') {
    // Keep current
    log.info('Keeping current placeholders');
    console.log('');
    log.warn('Remember to replace them before production!');
    console.log('');
  } else {
    log.warn('Invalid choice. No changes made.');
  }

  // Additional tips
  console.log('');
  log.info('💡 Pro tips:');
  console.log('');
  console.log('  • For professional logos, use https://logomaker.com/ or hire on Fiverr');
  console.log('  • For OG images, use https://shots.so/ or https://og-playground.vercel.app/');
  console.log('  • SVG files work with currentColor, so they adapt to your theme!');
  console.log('');

  log.success('Assets configuration complete!');
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
