#!/usr/bin/env node

/**
 * Step 3: Sync Missing Translation Keys
 *
 * Synchronizes translation keys between EN and ES files. Finds keys that
 * exist in one language but not the other and adds them with placeholder
 * values or AI-generated translations.
 *
 * Usage:
 *   node step-3-sync-missing-keys.mjs [options]
 *
 * Options:
 *   --path=<path>   Specific copies directory to sync (optional, default = all)
 *   --ai            Use AI to translate missing keys (requires ANTHROPIC_API_KEY)
 *   --dry-run       Show what would change without writing files
 *   --help          Show this help message
 *
 * Exit Codes:
 *   0 - Success (no missing keys or all synced)
 *   1 - Invalid arguments
 *   3 - Filesystem error
 *   4 - API error (if --ai is used)
 *
 * Examples:
 *   # Sync all translation files (dry run)
 *   node step-3-sync-missing-keys.mjs --dry-run
 *
 *   # Sync specific directory
 *   node step-3-sync-missing-keys.mjs --path=app/[locale]/(landing)/pricing/copies
 *
 *   # Sync with AI translation
 *   node step-3-sync-missing-keys.mjs --ai
 *
 *   # Sync specific directory with AI
 *   node step-3-sync-missing-keys.mjs --path=app/[locale]/(auth)/login/copies --ai
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';
import { AnthropicClient } from '../lib/anthropic-client.mjs';
import { getBrandContext } from '../lib/brand-loader.mjs';
import { detectNamespace } from '../lib/namespace-detector.mjs';
import {
  handleError,
  createValidationError,
  createFileError,
} from '../lib/error-handler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const REQUIRED_LOCALES = ['en', 'es'];
const PLACEHOLDER = '[NEEDS TRANSLATION]';

// ============================================================================
// Help
// ============================================================================

function showHelp() {
  const scriptName = path.basename(__filename);
  console.log(`
🔄 Step 3: Sync Missing Translation Keys

Usage:
  node ${scriptName} [options]

Options:
  --path=<path>   Specific copies directory to sync (optional)
  --ai            Use AI to translate missing keys
  --dry-run       Show changes without writing files
  --help          Show this help message

Examples:
  # Check all translation files
  node ${scriptName} --dry-run

  # Sync specific directory
  node ${scriptName} --path=app/[locale]/(landing)/pricing/copies

  # Sync all with AI translation
  node ${scriptName} --ai

  # Sync specific directory with AI
  node ${scriptName} --path=app/[locale]/(auth)/login/copies --ai

Behavior:
  - Without --ai: Adds missing keys with "${PLACEHOLDER}"
  - With --ai: Generates translations using Claude API
  - With --dry-run: Shows changes without modifying files

Exit Codes:
  0 - Success
  1 - Invalid arguments
  3 - Filesystem error
  4 - API error
`);
}

// ============================================================================
// Argument Parsing
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const pathArg = args.find((arg) => arg.startsWith('--path='));
  const useAI = args.includes('--ai');
  const dryRun = args.includes('--dry-run');

  const targetPath = pathArg ? pathArg.split('=')[1] : null;

  if (useAI && !process.env.ANTHROPIC_API_KEY) {
    throw createValidationError(
      'ANTHROPIC_API_KEY required when using --ai flag.\n' +
        'Get your API key from: https://console.anthropic.com/'
    );
  }

  return { targetPath, useAI, dryRun };
}

// ============================================================================
// Find Copies Directories
// ============================================================================

function findCopiesDirectories(targetPath) {
  if (targetPath) {
    const absolutePath = path.isAbsolute(targetPath)
      ? targetPath
      : path.join(projectRoot, targetPath);

    if (!fs.existsSync(absolutePath)) {
      throw createFileError(
        'read',
        absolutePath,
        'Path not found',
        3
      );
    }

    // If path ends with /copies, use it directly
    if (absolutePath.endsWith('/copies')) {
      return [absolutePath];
    }

    // If path has a copies subdirectory, use that
    const copiesSubdir = path.join(absolutePath, 'copies');
    if (fs.existsSync(copiesSubdir)) {
      return [copiesSubdir];
    }

    throw createValidationError(
      `No copies directory found at: ${absolutePath}\n` +
        'Path must be a copies directory or contain a copies subdirectory'
    );
  }

  // Find all copies directories in the project
  const pattern = path.join(projectRoot, 'src/**/copies').replace(/\\/g, '/');
  return glob.sync(pattern);
}

// ============================================================================
// Key Operations
// ============================================================================

function getAllKeys(obj, prefix = '') {
  let keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// ============================================================================
// AI Translation
// ============================================================================

async function translateWithAI(key, sourceText, targetLocale, namespace) {
  const client = new AnthropicClient();
  const brandContext = getBrandContext();

  const languageNames = {
    en: 'English (US)',
    es: 'Spanish (Spain/Latin America)',
  };

  const prompt = `You are a professional translator working on a SaaS application.

BRAND CONTEXT:
${brandContext}

TRANSLATION TASK:
- Namespace: ${namespace}
- Key: ${key}
- Source text (English): "${sourceText}"
- Target language: ${languageNames[targetLocale]}

INSTRUCTIONS:
1. Translate naturally for ${languageNames[targetLocale]}
2. Maintain the same tone and style
3. Consider the context (key path: ${key})
4. Keep placeholders like {name}, {email}, etc. unchanged
5. For UI elements, be concise
6. For marketing copy, be persuasive

OUTPUT:
Return ONLY the translated text, no explanations or quotes.`;

  try {
    const response = await client.generate(prompt, {
      maxTokens: 500,
      temperature: 0.3, // Lower temperature for more consistent translations
      jsonMode: false, // We want plain text, not JSON
    });

    // If response is wrapped in quotes, remove them
    const cleaned = typeof response === 'string'
      ? response.replace(/^["']|["']$/g, '')
      : response;

    return cleaned;
  } catch (error) {
    console.warn(`⚠️  Failed to translate "${key}", using placeholder`);
    return PLACEHOLDER;
  }
}

// ============================================================================
// Sync Operations
// ============================================================================

async function syncCopiesDirectory(copiesDir, useAI, dryRun) {
  const namespace = detectNamespace(copiesDir);
  const relativePath = path.relative(projectRoot, copiesDir);

  console.log(`\n📁 ${relativePath}`);
  console.log(`   Namespace: ${namespace || 'unknown'}`);

  // Read translation files
  const translations = {};
  const filePaths = {};

  for (const locale of REQUIRED_LOCALES) {
    const filePath = path.join(copiesDir, `${locale}.json`);
    filePaths[locale] = filePath;

    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Missing ${locale}.json - skipping sync`);
      return { changes: 0, errors: 1 };
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      translations[locale] = JSON.parse(content);
    } catch (error) {
      console.log(`   ❌ Invalid JSON in ${locale}.json - skipping`);
      return { changes: 0, errors: 1 };
    }
  }

  // Find missing keys
  const enKeys = getAllKeys(translations.en);
  const esKeys = getAllKeys(translations.es);

  const missingInES = enKeys.filter((key) => !esKeys.includes(key));
  const missingInEN = esKeys.filter((key) => !enKeys.includes(key));

  if (missingInES.length === 0 && missingInEN.length === 0) {
    console.log('   ✅ All keys in sync');
    return { changes: 0, errors: 0 };
  }

  // Show missing keys
  let changeCount = 0;

  if (missingInES.length > 0) {
    console.log(`   📝 Missing in ES: ${missingInES.length} keys`);
    for (const key of missingInES) {
      const sourceValue = getValueByPath(translations.en, key);
      let targetValue = PLACEHOLDER;

      if (useAI && !dryRun) {
        console.log(`      Translating: ${key}...`);
        targetValue = await translateWithAI(key, sourceValue, 'es', namespace);
      }

      if (!dryRun) {
        setValueByPath(translations.es, key, targetValue);
      }

      console.log(`      + ${key}: "${targetValue}"`);
      changeCount++;
    }
  }

  if (missingInEN.length > 0) {
    console.log(`   📝 Missing in EN: ${missingInEN.length} keys`);
    for (const key of missingInEN) {
      const sourceValue = getValueByPath(translations.es, key);
      let targetValue = PLACEHOLDER;

      if (useAI && !dryRun) {
        console.log(`      Translating: ${key}...`);
        targetValue = await translateWithAI(key, sourceValue, 'en', namespace);
      }

      if (!dryRun) {
        setValueByPath(translations.en, key, targetValue);
      }

      console.log(`      + ${key}: "${targetValue}"`);
      changeCount++;
    }
  }

  // Write updated files
  if (!dryRun && changeCount > 0) {
    for (const locale of REQUIRED_LOCALES) {
      const filePath = filePaths[locale];
      const formatted = JSON.stringify(translations[locale], null, 2);
      fs.writeFileSync(filePath, formatted, 'utf-8');
    }
    console.log(`   ✅ Updated files`);
  }

  return { changes: changeCount, errors: 0 };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    console.log('🔄 Step 3: Sync Missing Translation Keys\n');

    // Parse arguments
    const { targetPath, useAI, dryRun } = parseArgs();

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    if (useAI) {
      console.log('🤖 AI translation enabled\n');
    }

    // Find directories to sync
    const copiesDirs = findCopiesDirectories(targetPath);
    console.log(`Found ${copiesDirs.length} copies directories`);

    // Sync each directory
    let totalChanges = 0;
    let totalErrors = 0;

    for (const copiesDir of copiesDirs) {
      const { changes, errors } = await syncCopiesDirectory(
        copiesDir,
        useAI,
        dryRun
      );
      totalChanges += changes;
      totalErrors += errors;
    }

    // Display summary
    console.log('\n' + '='.repeat(70));

    if (dryRun) {
      console.log(`\n🔍 DRY RUN COMPLETE`);
      console.log(`   Would add: ${totalChanges} keys`);
      console.log(`   Errors: ${totalErrors} directories`);
      console.log('\nRun without --dry-run to apply changes');
    } else if (totalChanges > 0) {
      console.log(`\n✅ SYNC COMPLETE`);
      console.log(`   Added: ${totalChanges} keys`);
      console.log(`   Errors: ${totalErrors} directories`);
      console.log('\n📝 Next step: Review and edit placeholder translations');
    } else if (totalErrors > 0) {
      console.log(`\n⚠️  COMPLETED WITH ERRORS`);
      console.log(`   Errors: ${totalErrors} directories`);
      console.log('\nCheck error messages above for details');
    } else {
      console.log(`\n✅ ALL TRANSLATIONS IN SYNC`);
      console.log(`   No missing keys found`);
    }

    console.log('\n' + '='.repeat(70));

    process.exit(0);
  } catch (error) {
    handleError(error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { syncCopiesDirectory, getAllKeys, getValueByPath, setValueByPath };
