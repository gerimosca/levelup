#!/usr/bin/env node
/**
 * Validate All Translations
 *
 * Validates all translation files in the project for:
 * - Existence of both en.json and es.json
 * - Same keys in both languages
 * - Valid JSON structure
 * - Namespace mapping works correctly
 *
 * Usage:
 *   npm run i18n:validate
 *   node scripts/i18n/validation/validate-all-translations.mjs
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { detectNamespace } from '../lib/namespace-detector.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

// ===== Configuration =====
const REQUIRED_LOCALES = ['en', 'es'];
const SEARCH_PATTERN = '**/copies';
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git'
];

// ===== Main Function =====
async function validateAllTranslations() {
  console.log('\n🔍 Validating all translations...\n');

  const errors = [];
  const warnings = [];
  let totalCopies = 0;
  let validatedNamespaces = 0;

  try {
    // 1. Find all copies directories
    const copiesDirs = findAllCopiesDirectories();
    totalCopies = copiesDirs.length;

    if (totalCopies === 0) {
      console.log('⚠️  No copies/ directories found in the project.\n');
      console.log('This might be expected if you haven\'t created any translations yet.\n');
      return { success: true, validated: 0, errors: [], warnings: [] };
    }

    console.log(`Found ${totalCopies} copies/ ${totalCopies === 1 ? 'directory' : 'directories'}\n`);

    // 2. Validate each copies directory
    for (const copiesDir of copiesDirs) {
      const result = validateCopiesDirectory(copiesDir);

      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }

      if (result.warnings.length > 0) {
        warnings.push(...result.warnings);
      }

      if (result.valid) {
        validatedNamespaces++;
      }
    }

    // 3. Display results
    displayResults(validatedNamespaces, totalCopies, errors, warnings);

    // 4. Exit with appropriate code
    if (errors.length > 0) {
      process.exit(1);
    }

    return {
      success: true,
      validated: validatedNamespaces,
      total: totalCopies,
      errors,
      warnings
    };

  } catch (error) {
    console.error('\n❌ Validation failed with error:\n');
    console.error(error.message || error);
    process.exit(1);
  }
}

// ===== Discovery Functions =====

/**
 * Find all copies directories in the project
 */
function findAllCopiesDirectories() {
  const copiesDirs = [];

  function searchDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip ignored directories
        if (IGNORE_PATTERNS.some(pattern => entry.name.includes(pattern))) {
          continue;
        }

        if (entry.isDirectory()) {
          if (entry.name === 'copies') {
            copiesDirs.push(fullPath);
          } else {
            searchDirectory(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
      return;
    }
  }

  // Search in src/ directory
  const srcDir = path.join(projectRoot, 'src');
  if (fs.existsSync(srcDir)) {
    searchDirectory(srcDir);
  }

  return copiesDirs;
}

// ===== Validation Functions =====

/**
 * Validate a single copies directory
 */
function validateCopiesDirectory(copiesDir) {
  const errors = [];
  const warnings = [];
  let valid = true;

  const relativePath = path.relative(projectRoot, copiesDir);
  const parentDir = path.dirname(copiesDir);

  // 1. Check that all required locales exist
  const missingLocales = [];
  const existingFiles = {};

  for (const locale of REQUIRED_LOCALES) {
    const filePath = path.join(copiesDir, `${locale}.json`);

    if (!fs.existsSync(filePath)) {
      missingLocales.push(locale);
      valid = false;
    } else {
      existingFiles[locale] = filePath;
    }
  }

  if (missingLocales.length > 0) {
    errors.push({
      type: 'missing_files',
      path: relativePath,
      message: `Missing translation files: ${missingLocales.join(', ')}`
    });
  }

  // 2. If we have at least EN and ES, validate structure
  if (existingFiles['en'] && existingFiles['es']) {
    const structureResult = validateTranslationStructure(
      existingFiles['en'],
      existingFiles['es'],
      relativePath
    );

    errors.push(...structureResult.errors);
    warnings.push(...structureResult.warnings);

    if (structureResult.errors.length > 0) {
      valid = false;
    }
  }

  // 3. Validate namespace detection
  try {
    const namespace = detectNamespace(parentDir);

    if (!namespace) {
      warnings.push({
        type: 'namespace_detection',
        path: relativePath,
        message: 'Could not auto-detect namespace - path might not match known patterns'
      });
    } else {
      console.log(`✅ ${relativePath.padEnd(60)} → namespace: "${namespace}"`);
    }
  } catch (error) {
    warnings.push({
      type: 'namespace_detection',
      path: relativePath,
      message: `Namespace detection failed: ${error.message}`
    });
  }

  return { valid, errors, warnings };
}

/**
 * Validate structure between EN and ES files
 */
function validateTranslationStructure(enPath, esPath, relativePath) {
  const errors = [];
  const warnings = [];

  try {
    // Read and parse both files
    const enContent = fs.readFileSync(enPath, 'utf-8');
    const esContent = fs.readFileSync(esPath, 'utf-8');

    let enData, esData;

    try {
      enData = JSON.parse(enContent);
    } catch (parseError) {
      errors.push({
        type: 'invalid_json',
        path: `${relativePath}/en.json`,
        message: `Invalid JSON: ${parseError.message}`
      });
      return { errors, warnings };
    }

    try {
      esData = JSON.parse(esContent);
    } catch (parseError) {
      errors.push({
        type: 'invalid_json',
        path: `${relativePath}/es.json`,
        message: `Invalid JSON: ${parseError.message}`
      });
      return { errors, warnings };
    }

    // Compare keys
    const keyComparison = compareKeys(enData, esData, '');

    if (keyComparison.missingInES.length > 0) {
      errors.push({
        type: 'missing_keys',
        path: `${relativePath}/es.json`,
        message: `Missing keys: ${keyComparison.missingInES.join(', ')}`
      });
    }

    if (keyComparison.extraInES.length > 0) {
      warnings.push({
        type: 'extra_keys',
        path: `${relativePath}/es.json`,
        message: `Extra keys not in EN: ${keyComparison.extraInES.join(', ')}`
      });
    }

    // Check for empty values
    const emptyEN = findEmptyValues(enData, '');
    const emptyES = findEmptyValues(esData, '');

    if (emptyEN.length > 0) {
      warnings.push({
        type: 'empty_values',
        path: `${relativePath}/en.json`,
        message: `Empty values: ${emptyEN.join(', ')}`
      });
    }

    if (emptyES.length > 0) {
      warnings.push({
        type: 'empty_values',
        path: `${relativePath}/es.json`,
        message: `Empty values: ${emptyES.join(', ')}`
      });
    }

  } catch (error) {
    errors.push({
      type: 'read_error',
      path: relativePath,
      message: `Could not read files: ${error.message}`
    });
  }

  return { errors, warnings };
}

/**
 * Compare keys between two objects recursively
 */
function compareKeys(obj1, obj2, prefix) {
  const missingInES = [];
  const extraInES = [];

  // Check keys in obj1
  for (const key in obj1) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (!(key in obj2)) {
      missingInES.push(fullKey);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null &&
               typeof obj2[key] === 'object' && obj2[key] !== null) {
      // Recursively compare nested objects
      const nested = compareKeys(obj1[key], obj2[key], fullKey);
      missingInES.push(...nested.missingInES);
      extraInES.push(...nested.extraInES);
    }
  }

  // Check for extra keys in obj2
  for (const key in obj2) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (!(key in obj1)) {
      extraInES.push(fullKey);
    }
  }

  return { missingInES, extraInES };
}

/**
 * Find empty string values recursively
 */
function findEmptyValues(obj, prefix) {
  const empty = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'string' && value.trim() === '') {
      empty.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      empty.push(...findEmptyValues(value, fullKey));
    }
  }

  return empty;
}

// ===== Display Functions =====

/**
 * Display validation results
 */
function displayResults(validatedNamespaces, totalCopies, errors, warnings) {
  console.log('\n' + '='.repeat(70));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All translations validated successfully!\n');
    console.log(`   Validated: ${validatedNamespaces}/${totalCopies} namespaces`);
    console.log('   No errors or warnings found\n');
  } else {
    // Display errors
    if (errors.length > 0) {
      console.log('\n❌ Errors found:\n');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.path}`);
        console.log(`   ${error.message}\n`);
      });
    }

    // Display warnings
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:\n');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.path}`);
        console.log(`   ${warning.message}\n`);
      });
    }

    // Summary
    console.log('─'.repeat(70));
    console.log(`\nValidated: ${validatedNamespaces}/${totalCopies} namespaces`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}\n`);

    if (errors.length > 0) {
      console.log('❌ Validation failed - please fix the errors above\n');
    } else {
      console.log('⚠️  Validation passed with warnings\n');
    }
  }

  console.log('='.repeat(70) + '\n');
}

// ===== CLI Entry Point =====

// Check for help flag
if (process.argv.includes('--help')) {
  console.log(`
Usage: npm run i18n:validate

Validates all translation files in the project.

Checks:
  ✓ Both en.json and es.json exist
  ✓ Same keys in both languages
  ✓ Valid JSON syntax
  ✓ Namespace mapping works
  ✓ No empty values (warning)

Exit codes:
  0 - All validations passed
  1 - Validation errors found
  `);
  process.exit(0);
}

// Run validation
validateAllTranslations();
