#!/usr/bin/env node

/**
 * Generate Static Translations
 *
 * This script generates static translation files at build time for maximum runtime performance.
 * It reads all copies/ files and generates consolidated JSON files per locale.
 *
 * Usage:
 *   node generate-static-translations.mjs
 *
 * Output:
 *   src/i18n/generated/en.json
 *   src/i18n/generated/es.json
 *
 * When to run:
 *   - Before build (prebuild script)
 *   - Before dev (to ensure files exist)
 *   - After editing translation files
 *
 * Why:
 *   Instead of reading 32 JSON files on every request (slow), we pre-generate
 *   consolidated files that can be imported statically (fast).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const LOCALES = ['en', 'es'];
const OUTPUT_DIR = path.join(projectRoot, 'src/i18n/generated');

// ============================================================================
// Namespace Detection (simplified from namespace-detector.mjs)
// ============================================================================

const namespaceMappings = [
  {
    pattern: /src\/app\/\[locale\]\/\([^\/]+\)\/(.+)\/copies\//,
    extractor: (match) => match[1].replace(/\//g, '-'),
  },
  {
    pattern: /src\/app\/\[locale\]\/\(([^)]+)\)\/copies\//,
    extractor: (match) => match[1],
  },
  {
    pattern: /src\/app\/\[locale\]\/\[\.\.\.rest\]\/copies\//,
    extractor: () => 'errors',
  },
  {
    pattern: /src\/app\/\[locale\]\/_shared\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },
  {
    pattern: /src\/core\/features\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },
  {
    pattern: /src\/my-saas\/features\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },
  {
    pattern: /src\/core\/shared\/components\/ui\/copies\//,
    extractor: () => 'ui',
  },
  {
    pattern: /src\/core\/shared\/components\/layouts\/copies\//,
    extractor: () => 'layouts',
  },
  {
    pattern: /src\/core\/shared\/components\/seo\/copies\//,
    extractor: () => 'seo',
  },
  {
    pattern: /src\/core\/shared\/legal\/copies\//,
    extractor: () => 'legal',
  },
  {
    pattern: /src\/core\/shared\/errors\/copies\//,
    extractor: () => 'errors',
  },
];

function extractNamespace(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  for (const mapping of namespaceMappings) {
    const match = normalized.match(mapping.pattern);
    if (match) {
      return mapping.extractor(match);
    }
  }

  // Fallback: extract from last directory before /copies
  const copiesMatch = normalized.match(/\/([^\/]+)\/copies\//);
  if (copiesMatch) {
    return copiesMatch[1];
  }

  return null;
}

// ============================================================================
// Load Copies from Disk
// ============================================================================

async function loadCopiesForLocale(locale) {
  console.log(`\n📚 Loading copies for locale: ${locale}`);

  const messages = {};
  const pattern = `src/**/copies/${locale}.json`;

  const files = glob.sync(pattern, {
    cwd: projectRoot,
    absolute: true,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/generated/**', // Don't include previously generated files
    ],
  });

  console.log(`   Found ${files.length} translation files`);

  for (const filePath of files) {
    try {
      const namespace = extractNamespace(filePath);

      if (!namespace) {
        console.warn(`   ⚠️  Could not detect namespace for: ${path.relative(projectRoot, filePath)}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);

      if (messages[namespace]) {
        console.warn(
          `   ⚠️  Duplicate namespace "${namespace}" found:\n` +
          `      ${path.relative(projectRoot, filePath)}\n` +
          `      Previous definition will be overwritten.`
        );
      }

      messages[namespace] = translations;
      console.log(`   ✅ ${namespace} (${path.relative(projectRoot, filePath)})`);
    } catch (error) {
      console.error(`   ❌ Failed to load ${path.relative(projectRoot, filePath)}:`, error.message);
      throw error;
    }
  }

  const namespaceCount = Object.keys(messages).length;
  if (namespaceCount === 0) {
    throw new Error(
      `No translation files found for locale "${locale}". ` +
      `Expected pattern: ${pattern}`
    );
  }

  console.log(`   ✅ Loaded ${namespaceCount} namespaces`);

  return messages;
}

// ============================================================================
// Generate Static Files
// ============================================================================

function ensureOutputDirectory() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`\n📁 Created output directory: ${path.relative(projectRoot, OUTPUT_DIR)}`);
  }
}

function writeStaticFile(locale, messages) {
  const outputPath = path.join(OUTPUT_DIR, `${locale}.json`);
  const content = JSON.stringify(messages, null, 2);

  fs.writeFileSync(outputPath, content, 'utf-8');

  const size = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(2);
  console.log(`   ✅ ${locale}.json (${size} KB)`);

  return outputPath;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🚀 Generating static translation files...\n');
  console.log('=' .repeat(70));

  try {
    // Ensure output directory exists
    ensureOutputDirectory();

    // Generate for each locale
    const generatedFiles = [];

    for (const locale of LOCALES) {
      const messages = await loadCopiesForLocale(locale);
      const filePath = writeStaticFile(locale, messages);
      generatedFiles.push(filePath);
    }

    // Success summary
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ Static translation files generated successfully!\n');

    console.log('📄 Generated files:');
    generatedFiles.forEach(file => {
      console.log(`   • ${path.relative(projectRoot, file)}`);
    });

    console.log('\n💡 These files are now used by src/i18n/request.ts');
    console.log('   Runtime performance: < 1ms per request (vs ~50-100ms before)\n');

    console.log('🔄 Next steps:');
    console.log('   • If you edit translation files, run: npm run i18n:generate-static');
    console.log('   • Or add a file watcher for automatic regeneration');
    console.log('\n' + '='.repeat(70));

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('\n❌ Failed to generate static translations\n');
    console.error('Error:', error.message);
    console.error('\n' + '='.repeat(70));
    process.exit(1);
  }
}

// Run if called directly (cross-platform: pathToFileURL maneja rutas Windows)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { loadCopiesForLocale, writeStaticFile };
