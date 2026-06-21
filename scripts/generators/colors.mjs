#!/usr/bin/env node

/**
 * Brand Colors Configuration Script
 * Run with: node scripts/generators/colors.mjs
 *
 * Configures brand colors (primary, secondary) in globals.css
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

// Predefined color palettes (HSL format: Hue Saturation% Lightness%)
const palettes = {
  1: {
    name: 'Professional Blue',
    primary: '220 91% 54%', // #1677FF - Clean professional blue
    description: 'Clean and trustworthy (ideal for B2B, fintech, healthcare)',
  },
  2: {
    name: 'Modern Purple',
    primary: '262 83% 58%', // #7C3AED - Modern and creative
    description: 'Modern and creative (ideal for SaaS, tech, creative tools)',
  },
  3: {
    name: 'Fresh Green',
    primary: '160 84% 39%', // #10B981 - Fresh and energetic
    description: 'Fresh and growth-oriented (ideal for sustainability, health, education)',
  },
  4: {
    name: 'Vibrant Orange',
    primary: '36 100% 50%', // #FF9900 - Energetic and bold
    description: 'Energetic and bold (ideal for e-commerce, consumer apps, food)',
  },
  5: {
    name: 'Deep Indigo',
    primary: '239 84% 67%', // #6366F1 - Sophisticated and calm
    description: 'Sophisticated and calm (ideal for enterprise, consulting, AI)',
  },
};

/**
 * Convert HEX to HSL
 * @param {string} hex - Hex color (with or without #)
 * @returns {string} HSL string in format "H S% L%"
 */
function hexToHSL(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

/**
 * Update colors in globals.css
 * @param {string} primary - Primary color in HSL format "H S% L%"
 */
function updateGlobalCSS(primary) {
  const cssPath = join(rootDir, 'src/app/[locale]/globals.css');
  let cssContent = readFileSync(cssPath, 'utf-8');

  // Update light mode primary
  cssContent = cssContent.replace(/--primary: .*?;/, `--primary: ${primary};`);

  // Update ring color (usually same as primary)
  cssContent = cssContent.replace(/--ring: .*?;/g, `--ring: ${primary};`);

  writeFileSync(cssPath, cssContent);
  log.success('globals.css updated');
}

/**
 * Get AI color suggestion
 */
async function getAISuggestion(businessDescription) {
  try {
    log.info('Asking Claude for color suggestion...');

    const prompt = `Based on this business description, suggest a primary color that fits the brand.

Business: ${businessDescription}

Return ONLY a JSON object (no markdown, no explanation) with:
{
  "hex": "#1677FF",
  "reasoning": "brief explanation why this color fits"
}`;

    const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      cwd: rootDir,
      timeout: 30000,
    });

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestion = JSON.parse(jsonMatch[0]);
      return suggestion;
    }

    return null;
  } catch (error) {
    log.warn('Could not get AI suggestion');
    return null;
  }
}

async function main() {
  log.title('Configure Brand Colors');

  log.info('This will update the primary color of your brand in globals.css');
  console.log('');

  // Step 1: Choose method
  console.log('How would you like to configure your brand colors?\n');
  console.log('  [1] Select from predefined palette (recommended)');
  console.log('  [2] Enter custom HEX color');
  console.log('  [3] AI suggestion (requires Claude Code)');
  console.log('');

  const choice = await question('Select option [1-3]: ');

  let primaryHSL;

  if (choice === '1') {
    // Predefined palette
    console.log('\n');
    log.step('Predefined Color Palettes');
    console.log('');

    Object.entries(palettes).forEach(([num, palette]) => {
      console.log(`  ${num}. ${colors.bright}${palette.name}${colors.reset}`);
      console.log(`     ${palette.description}`);
      console.log('');
    });

    const paletteChoice = await question('Select palette [1-5]: ');
    const selectedPalette = palettes[paletteChoice];

    if (!selectedPalette) {
      log.warn('Invalid choice. Using default (Professional Blue)');
      primaryHSL = palettes[1].primary;
    } else {
      primaryHSL = selectedPalette.primary;
      log.info(`Selected: ${selectedPalette.name}`);
    }
  } else if (choice === '2') {
    // Custom HEX
    console.log('\n');
    const hexColor = await question('Enter primary color in HEX (e.g., #1677FF): ');

    const cleanHex = hexColor.replace('#', '');
    if (!/^[0-9A-F]{6}$/i.test(cleanHex)) {
      log.warn('Invalid HEX color. Using default.');
      primaryHSL = '220 91% 54%';
    } else {
      primaryHSL = hexToHSL(cleanHex);
      log.success(`Converted ${hexColor} to HSL: ${primaryHSL}`);
    }
  } else if (choice === '3') {
    // AI suggestion
    console.log('\n');
    const businessDesc = await question(
      'Describe your business in one sentence:\n> '
    );

    if (businessDesc) {
      const aiSuggestion = await getAISuggestion(businessDesc);

      if (aiSuggestion) {
        console.log('\n');
        log.success('AI suggested color:');
        console.log(`  Color: ${aiSuggestion.hex}`);
        console.log(`  Reasoning: ${aiSuggestion.reasoning}`);
        console.log('');

        const accept = await question('Use this color? [Y/n]: ');
        if (!accept || accept.toLowerCase() === 'y' || accept.toLowerCase() === 'yes') {
          primaryHSL = hexToHSL(aiSuggestion.hex);
        } else {
          log.info('Falling back to default color');
          primaryHSL = '220 91% 54%';
        }
      } else {
        log.warn('AI suggestion failed. Using default.');
        primaryHSL = '220 91% 54%';
      }
    } else {
      log.warn('No description provided. Using default.');
      primaryHSL = '220 91% 54%';
    }
  } else {
    log.warn('Invalid choice. Using default.');
    primaryHSL = '220 91% 54%';
  }

  // Step 2: Update globals.css
  console.log('\n');
  log.step('Updating globals.css...');

  updateGlobalCSS(primaryHSL);

  // Done
  console.log('\n');
  log.success('Brand colors configured successfully!');
  console.log('');
  log.info('Next steps:');
  console.log('  1. Restart your dev server (npm run dev)');
  console.log('  2. Check your app to see the new colors');
  console.log(
    "  3. You can always run this script again to change colors"
  );
  console.log('');

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
