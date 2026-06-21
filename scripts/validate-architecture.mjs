#!/usr/bin/env node

/**
 * Architecture Validation Script
 *
 * Validates that the VSA (Vertical Slice Architecture) is correctly maintained:
 * - Checks directory structure
 * - Detects cross-feature imports
 * - Validates import patterns
 *
 * Run: npm run validate:architecture
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let errors = [];
let warnings = [];

/**
 * Check if required directories exist
 */
function checkDirectoryStructure() {
  console.log(`${colors.blue}📁 Checking directory structure...${colors.reset}`);

  const requiredDirs = [
    'src/features',
    'src/shared',
    'src/app',
    'src/i18n',
  ];

  for (const dir of requiredDirs) {
    const fullPath = join(rootDir, dir);
    if (!existsSync(fullPath)) {
      errors.push(`Missing required directory: ${dir}`);
    } else {
      console.log(`  ✓ ${dir}`);
    }
  }
}

/**
 * Get all TypeScript files recursively
 */
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract imports from a file
 */
function extractImports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const importRegex = /from\s+['"](@\/[^'"]+)['"]/g;
  const imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Check for cross-feature imports in src/features
 */
function checkCrossFeatureImports() {
  console.log(`\n${colors.blue}🔍 Checking for cross-feature imports...${colors.reset}`);

  const featuresDir = join(rootDir, 'src/features');
  if (!existsSync(featuresDir)) return;

  const files = getAllFiles(featuresDir);
  let foundIssues = 0;

  files.forEach(filePath => {
    const relativePath = relative(rootDir, filePath);

    // Extract feature name from path: src/features/[feature-name]/...
    const pathParts = relativePath.split('/');
    const featureIndex = pathParts.indexOf('features');
    if (featureIndex === -1 || featureIndex + 1 >= pathParts.length) return;

    const currentFeature = pathParts[featureIndex + 1];
    const imports = extractImports(filePath);

    imports.forEach(importPath => {
      // Check for old @/core/ pattern (legacy)
      if (importPath.startsWith('@/core/')) {
        errors.push(`${relativePath}: Using old import pattern "${importPath}". Use @/features/ or @/shared/ instead.`);
        foundIssues++;
      }

      // Check for cross-feature imports (excluding shared and platform services)
      if (importPath.startsWith('@/features/')) {
        const importedFeature = importPath.replace('@/features/', '').split('/')[0];

        // Platform services that can be imported by any feature
        // These are infrastructure services used across multiple features
        const PLATFORM_SERVICES = ['attribution', 'billing'];

        // Allow imports from shared, same feature, and platform services
        if (importedFeature !== 'shared' &&
            importedFeature !== currentFeature &&
            !PLATFORM_SERVICES.includes(importedFeature)) {
          errors.push(
            `${relativePath}: Cross-feature import detected!\n` +
            `  Feature "${currentFeature}" is importing from "${importedFeature}"\n` +
            `  Import: ${importPath}\n` +
            `  → Move shared code to @/shared/ instead.`
          );
          foundIssues++;
        }
      }
    });
  });

  if (foundIssues === 0) {
    console.log(`  ✓ No cross-feature imports found`);
  } else {
    console.log(`  ${colors.red}✗ Found ${foundIssues} cross-feature import issue(s)${colors.reset}`);
  }
}

/**
 * Check for legacy import patterns across the codebase
 */
function checkLegacyImports() {
  console.log(`\n${colors.blue}🔍 Checking for legacy import patterns...${colors.reset}`);

  const srcDir = join(rootDir, 'src');
  if (!existsSync(srcDir)) return;

  const files = getAllFiles(srcDir);
  let foundIssues = 0;

  files.forEach(filePath => {
    const relativePath = relative(rootDir, filePath);
    const imports = extractImports(filePath);

    imports.forEach(importPath => {
      // Check for old @/core/ pattern
      if (importPath.startsWith('@/core/')) {
        errors.push(`${relativePath}: Using legacy import pattern "${importPath}". Should use @/features/ or @/shared/.`);
        foundIssues++;
      }

      // Check for old @/my-saas/ pattern
      if (importPath.startsWith('@/my-saas/')) {
        errors.push(`${relativePath}: Using legacy import pattern "${importPath}". Should use @/features/ or @/shared/.`);
        foundIssues++;
      }
    });
  });

  if (foundIssues === 0) {
    console.log(`  ✓ No legacy import patterns found`);
  } else {
    console.log(`  ${colors.red}✗ Found ${foundIssues} legacy import pattern(s)${colors.reset}`);
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log(`\n${'='.repeat(60)}`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}✓ Architecture validation passed!${colors.reset}`);
    console.log(`\nAll checks passed. The VSA architecture is correctly maintained.`);
  } else {
    if (errors.length > 0) {
      console.log(`${colors.red}✗ Found ${errors.length} error(s):${colors.reset}\n`);
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}\n`);
      });
    }

    if (warnings.length > 0) {
      console.log(`${colors.yellow}⚠ Found ${warnings.length} warning(s):${colors.reset}\n`);
      warnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning}\n`);
      });
    }

    console.log(`${'='.repeat(60)}\n`);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.blue}🏗️  Validating Architecture${colors.reset}\n`);

  checkDirectoryStructure();
  checkCrossFeatureImports();
  checkLegacyImports();

  printSummary();
}

main();
