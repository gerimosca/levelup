#!/usr/bin/env node
/**
 * Step 1: Create Translation Structure
 *
 * Creates empty translation files (en.json, es.json) at specified path.
 * Does NOT generate content - only creates structure with template.
 *
 * Usage:
 *   npm run i18n:create-structure -- --path=app/[locale]/(landing)/pricing
 *   node scripts/i18n/generators/step-1-create-translation-structure.mjs --path=...
 *
 * Exit codes:
 *   0 - Success
 *   1 - Invalid path or arguments
 *   2 - Files already exist
 *   3 - Permission/file system error
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { detectNamespace, validateNamespace } from '../lib/namespace-detector.mjs';
import { handleError, createValidationError, createFileError } from '../lib/error-handler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

// ===== Configuration =====
const REQUIRED_LOCALES = ['en', 'es'];
const TEMPLATE_STRUCTURE = {
  page: {
    title: '',
    description: ''
  },
  content: {},
  actions: {},
  errors: {}
};

// ===== Main Function =====
async function createTranslationStructure(targetPath) {
  console.log('\n📁 Step 1: Creating translation structure\n');

  try {
    // 1. Validate input
    const validatedPath = validateAndNormalizePath(targetPath);

    // 2. Check if copies directory already exists
    const copiesDir = path.join(validatedPath, 'copies');
    checkExistingCopies(copiesDir);

    // 3. Create copies directory
    createDirectory(copiesDir);

    // 4. Create translation files for each locale
    const createdFiles = [];
    for (const locale of REQUIRED_LOCALES) {
      const filePath = path.join(copiesDir, `${locale}.json`);
      createTranslationFile(filePath);
      createdFiles.push(filePath);
    }

    // 5. Detect and validate namespace
    const namespace = detectNamespace(validatedPath);
    validateNamespace(validatedPath, namespace);

    // 6. Display success message
    displaySuccessMessage(copiesDir, namespace, createdFiles);

    return {
      success: true,
      namespace,
      copiesDir,
      files: createdFiles
    };

  } catch (error) {
    handleError(error);
    process.exit(error.code || 1);
  }
}

// ===== Validation Functions =====

/**
 * Validate and normalize the target path
 */
function validateAndNormalizePath(targetPath) {
  if (!targetPath) {
    throw createValidationError(
      '--path argument is required\n\n' +
      'Usage:\n' +
      '  npm run i18n:create-structure -- --path=app/[locale]/(landing)/pricing\n\n' +
      'Example paths:\n' +
      '  app/[locale]/(landing)/pricing\n' +
      '  app/[locale]/(auth)/login\n' +
      '  app/[locale]/(app)/dashboard',
      1
    );
  }

  // Make path absolute if relative
  const absolutePath = path.isAbsolute(targetPath)
    ? targetPath
    : path.join(projectRoot, targetPath);

  // Check if path exists
  if (!fs.existsSync(absolutePath)) {
    throw createValidationError(
      `Path does not exist: ${targetPath}\n\n` +
      'Please create the page/component directory first.\n\n' +
      'Example:\n' +
      '  mkdir -p app/[locale]/(landing)/pricing',
      1
    );
  }

  // Check if it's a directory
  const stats = fs.statSync(absolutePath);
  if (!stats.isDirectory()) {
    throw createValidationError(
      `Path is not a directory: ${targetPath}\n\n` +
      'Provide a directory path, not a file.',
      1
    );
  }

  return absolutePath;
}

/**
 * Check if copies directory already exists
 */
function checkExistingCopies(copiesDir) {
  if (fs.existsSync(copiesDir)) {
    // Check if any translation files exist
    const existingFiles = REQUIRED_LOCALES
      .map(locale => path.join(copiesDir, `${locale}.json`))
      .filter(file => fs.existsSync(file));

    if (existingFiles.length > 0) {
      throw {
        code: 2,
        message: `Copies directory already exists with translation files:\n\n` +
          existingFiles.map(f => `  - ${path.relative(projectRoot, f)}`).join('\n') +
          '\n\nOptions:\n' +
          '  1. Delete the existing copies/ directory\n' +
          '  2. Use a different path\n' +
          '  3. Edit the existing files manually'
      };
    }
  }
}

// ===== Creation Functions =====

/**
 * Create a directory with error handling
 */
function createDirectory(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${path.relative(projectRoot, dir)}`);
  } catch (error) {
    throw createFileError(
      'create',
      path.relative(projectRoot, dir),
      `Check permissions and disk space.\n\nError: ${error.message}`,
      3
    );
  }
}

/**
 * Create a translation file with template
 */
function createTranslationFile(filePath) {
  try {
    const content = JSON.stringify(TEMPLATE_STRUCTURE, null, 2);
    fs.writeFileSync(filePath, content + '\n', 'utf-8');
    console.log(`✅ Created file: ${path.relative(projectRoot, filePath)}`);
  } catch (error) {
    throw createFileError(
      'write',
      path.relative(projectRoot, filePath),
      `Check permissions and disk space.\n\nError: ${error.message}`,
      3
    );
  }
}

// ===== Display Functions =====

/**
 * Display success message with helpful next steps
 */
function displaySuccessMessage(copiesDir, namespace, files) {
  const relativeDir = path.relative(projectRoot, copiesDir);

  console.log('\n✅ Translation structure created successfully!\n');
  console.log('📍 Location:');
  console.log(`   ${relativeDir}\n`);
  console.log('📄 Files created:');
  files.forEach(file => {
    console.log(`   - ${path.basename(file)}`);
  });
  console.log(`\n🏷️  Auto-detected namespace: "${namespace}"`);
  console.log('\n💡 This namespace will be used in your components:');
  console.log(`   const t = useTranslations('${namespace}');\n`);
  console.log('📝 Next steps:\n');
  console.log('   Option A (Manual):');
  console.log(`     Edit the files in ${relativeDir}/\n`);
  console.log('   Option B (AI-Generated):');
  console.log('     If you have meta-copies for this feature, run:');
  console.log('     npm run i18n:generate-ai -- --source=... --target=...\n');
  console.log('   Option C (Claude Code):');
  console.log('     /generate-copies\n');
}

// ===== CLI Entry Point =====

// Parse command line arguments
const args = process.argv.slice(2);
const pathArg = args.find(arg => arg.startsWith('--path='));

if (!pathArg && args.includes('--help')) {
  console.log(`
Usage: npm run i18n:create-structure -- --path=<target-path>

Creates empty translation structure (en.json, es.json) at the specified path.

Arguments:
  --path=<path>    Target directory path (required)

Examples:
  npm run i18n:create-structure -- --path=app/[locale]/(landing)/pricing
  npm run i18n:create-structure -- --path=app/[locale]/(auth)/login
  npm run i18n:create-structure -- --path=app/[locale]/(app)/dashboard

Exit codes:
  0 - Success
  1 - Invalid arguments or path doesn't exist
  2 - Copies already exist
  3 - File system error
  `);
  process.exit(0);
}

const targetPath = pathArg ? pathArg.split('=')[1] : null;

// Run the script
createTranslationStructure(targetPath);
