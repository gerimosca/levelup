#!/usr/bin/env node

/**
 * Step 2: Generate Translation Content with AI
 *
 * Reads meta-copies (LLM prompts) and generates actual translations
 * using Anthropic Claude API for each locale (en, es).
 *
 * Usage:
 *   node step-2-generate-content-with-ai.mjs --source=core/features/home/meta-copies --target=app/[locale]/(landing)/pricing
 *
 * Options:
 *   --source   Path to meta-copies directory (contains texts.json)
 *   --target   Path to target directory (where to create copies/)
 *   --help     Show this help message
 *
 * Exit Codes:
 *   0 - Success
 *   1 - Invalid arguments or validation error
 *   2 - Meta-copies not found
 *   3 - Filesystem error
 *   4 - API error (Anthropic)
 *   5 - Target validation failed
 *
 * Examples:
 *   # Generate copies for pricing page from home meta-copies
 *   node step-2-generate-content-with-ai.mjs \
 *     --source=src/core/features/home/meta-copies \
 *     --target=src/app/[locale]/(landing)/pricing
 *
 *   # Generate auth copies
 *   node step-2-generate-content-with-ai.mjs \
 *     --source=src/core/features/auth/meta-copies \
 *     --target=src/app/[locale]/(auth)/login
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AnthropicClient } from '../lib/anthropic-client.mjs';
import { getBrandContext } from '../lib/brand-loader.mjs';
import { detectNamespace, validateNamespace } from '../lib/namespace-detector.mjs';
import {
  handleError,
  createValidationError,
  createFileError,
} from '../lib/error-handler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

const REQUIRED_LOCALES = ['en', 'es'];
const META_COPIES_FILE = 'texts.json';

// ============================================================================
// Help
// ============================================================================

function showHelp() {
  const scriptName = path.basename(__filename);
  console.log(`
📝 Step 2: Generate Translation Content with AI

Usage:
  node ${scriptName} --source=<path> --target=<path>

Options:
  --source   Path to meta-copies directory (contains texts.json)
  --target   Path to target directory (where to create copies/)
  --help     Show this help message

Examples:
  # Generate for landing page
  node ${scriptName} \\
    --source=src/core/features/home/meta-copies \\
    --target=src/app/[locale]/(landing)/pricing

  # Generate for auth pages
  node ${scriptName} \\
    --source=src/core/features/auth/meta-copies \\
    --target=src/app/[locale]/(auth)/login

Requirements:
  - ANTHROPIC_API_KEY environment variable must be set
  - Source directory must contain texts.json
  - Target directory must exist

Exit Codes:
  0 - Success
  1 - Invalid arguments
  2 - Meta-copies not found
  3 - Filesystem error
  4 - API error
  5 - Validation failed
`);
}

// ============================================================================
// Validation
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const sourceArg = args.find((arg) => arg.startsWith('--source='));
  const targetArg = args.find((arg) => arg.startsWith('--target='));

  if (!sourceArg || !targetArg) {
    console.error('❌ Error: Missing required arguments\n');
    console.error('Required: --source=<path> --target=<path>\n');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const source = sourceArg.split('=')[1];
  const target = targetArg.split('=')[1];

  if (!source || !target) {
    throw createValidationError('Source and target paths cannot be empty');
  }

  return { source, target };
}

function validatePaths(sourcePath, targetPath) {
  // Validate source
  const absoluteSource = path.isAbsolute(sourcePath)
    ? sourcePath
    : path.join(projectRoot, sourcePath);

  if (!fs.existsSync(absoluteSource)) {
    throw createFileError(
      'read',
      absoluteSource,
      'Meta-copies directory not found',
      2
    );
  }

  const textsJsonPath = path.join(absoluteSource, META_COPIES_FILE);
  if (!fs.existsSync(textsJsonPath)) {
    throw createFileError(
      'read',
      textsJsonPath,
      `${META_COPIES_FILE} not found in source directory`,
      2
    );
  }

  // Validate target
  const absoluteTarget = path.isAbsolute(targetPath)
    ? targetPath
    : path.join(projectRoot, targetPath);

  if (!fs.existsSync(absoluteTarget)) {
    throw createFileError(
      'write',
      absoluteTarget,
      'Target directory not found. Create it first.',
      3
    );
  }

  return {
    source: absoluteSource,
    target: absoluteTarget,
    textsJson: textsJsonPath,
  };
}

function validateAPIKey() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw createValidationError(
      'ANTHROPIC_API_KEY environment variable is required.\n' +
        'Get your API key from: https://console.anthropic.com/'
    );
  }
}

// ============================================================================
// Meta-Copies Loading
// ============================================================================

function loadMetaCopies(textsJsonPath) {
  try {
    const content = fs.readFileSync(textsJsonPath, 'utf-8');
    const metaCopies = JSON.parse(content);

    // Remove _meta fields (they're just for documentation)
    const cleanMetaCopies = { ...metaCopies };
    delete cleanMetaCopies._meta;

    // Remove _note fields from nested objects
    const removeNotes = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;

      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('_')) continue; // Skip all _ prefixed keys
        cleaned[key] = typeof value === 'object' ? removeNotes(value) : value;
      }
      return cleaned;
    };

    return removeNotes(cleanMetaCopies);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createFileError('read', textsJsonPath, 'File not found', 2);
    }
    throw createFileError(
      'read',
      textsJsonPath,
      `Invalid JSON: ${error.message}`,
      2
    );
  }
}

// ============================================================================
// AI Content Generation
// ============================================================================

function buildPrompt(metaCopies, locale, brandContext) {
  const languageInstructions = {
    en: 'English (US)',
    es: 'Spanish (Spain/Latin America)',
  };

  return `You are a professional copywriter tasked with generating compelling marketing and UI copy.

BRAND CONTEXT:
${brandContext}

META-COPIES (Instructions for each field):
${JSON.stringify(metaCopies, null, 2)}

TASK:
Generate actual copy for each field in ${languageInstructions[locale]}.

INSTRUCTIONS:
1. Read each meta-copy instruction carefully
2. Follow the guidance provided (examples, tone, length, etc.)
3. Generate copy that matches the brand voice
4. Focus on conversion and clarity
5. Keep the EXACT same JSON structure
6. Replace the instructions with actual copy

IMPORTANT:
- Output ONLY valid JSON (no markdown, no explanations)
- Maintain the exact structure of the input
- Every field must have actual copy, not instructions
- Use the brand name "${brandContext.split('\n')[0].split(':')[1]?.trim() || 'the product'}" naturally
- Match the locale: ${languageInstructions[locale]}

OUTPUT FORMAT:
Return the same JSON structure with actual copy instead of instructions.`;
}

async function generateContentForLocale(metaCopies, locale, brandContext) {
  console.log(`\n🤖 Generating ${locale.toUpperCase()} content with AI...`);

  const client = new AnthropicClient();
  const prompt = buildPrompt(metaCopies, locale, brandContext);

  try {
    const content = await client.generate(prompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    console.log(`✅ Generated ${locale.toUpperCase()} content`);
    return content;
  } catch (error) {
    console.error(`❌ Failed to generate ${locale.toUpperCase()} content`);
    throw error;
  }
}

// ============================================================================
// File Writing
// ============================================================================

function ensureCopiesDirectory(targetPath) {
  const copiesDir = path.join(targetPath, 'copies');

  if (!fs.existsSync(copiesDir)) {
    try {
      fs.mkdirSync(copiesDir, { recursive: true });
      console.log(`\n📁 Created copies/ directory`);
    } catch (error) {
      throw createFileError(
        'create',
        copiesDir,
        `Failed to create directory: ${error.message}`,
        3
      );
    }
  }

  return copiesDir;
}

function writeTranslationFile(copiesDir, locale, content) {
  const filePath = path.join(copiesDir, `${locale}.json`);

  try {
    const formatted = JSON.stringify(content, null, 2);
    fs.writeFileSync(filePath, formatted, 'utf-8');
    console.log(`✅ Created ${locale}.json`);
    return filePath;
  } catch (error) {
    throw createFileError(
      'write',
      filePath,
      `Failed to write file: ${error.message}`,
      3
    );
  }
}

// ============================================================================
// Validation
// ============================================================================

function validateGeneratedContent(metaCopies, generatedContent, locale) {
  const metaKeys = getAllKeys(metaCopies);
  const generatedKeys = getAllKeys(generatedContent);

  const missingKeys = metaKeys.filter((key) => !generatedKeys.includes(key));
  const extraKeys = generatedKeys.filter((key) => !metaKeys.includes(key));

  if (missingKeys.length > 0 || extraKeys.length > 0) {
    console.warn(
      `\n⚠️  Warning: Structure mismatch in ${locale.toUpperCase()}`
    );
    if (missingKeys.length > 0) {
      console.warn(`   Missing keys: ${missingKeys.join(', ')}`);
    }
    if (extraKeys.length > 0) {
      console.warn(`   Extra keys: ${extraKeys.join(', ')}`);
    }
  }
}

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    }
  }
  return keys;
}

// ============================================================================
// Display Results
// ============================================================================

function displaySuccess(copiesDir, namespace, files) {
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Translation content generated successfully!\n');

  console.log('📁 Created files:');
  files.forEach((file) => {
    const relativePath = path.relative(projectRoot, file);
    console.log(`   • ${relativePath}`);
  });

  console.log(`\n🏷️  Namespace detected: "${namespace}"`);

  console.log('\n📝 Next steps:');
  console.log('   1. Review generated content in copies/ directory');
  console.log('   2. Edit any content that needs refinement');
  console.log(`   3. Use in your code: useTranslations('${namespace}')`);
  console.log('   4. Run: npm run i18n:validate');

  console.log('\n' + '='.repeat(70));
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    console.log('🚀 Step 2: Generate Translation Content with AI\n');

    // 1. Parse and validate arguments
    const { source, target } = parseArgs();

    // 2. Validate API key
    validateAPIKey();

    // 3. Validate paths
    const { source: absoluteSource, target: absoluteTarget, textsJson } = validatePaths(source, target);

    console.log(`📖 Source: ${path.relative(projectRoot, absoluteSource)}`);
    console.log(`📝 Target: ${path.relative(projectRoot, absoluteTarget)}`);

    // 4. Load meta-copies
    console.log('\n📄 Loading meta-copies...');
    const metaCopies = loadMetaCopies(textsJson);
    console.log(`✅ Loaded ${Object.keys(metaCopies).length} sections`);

    // 5. Load brand context
    const brandContext = getBrandContext();

    // 6. Ensure copies directory exists
    const copiesDir = ensureCopiesDirectory(absoluteTarget);

    // 7. Generate content for each locale
    const generatedFiles = [];
    for (const locale of REQUIRED_LOCALES) {
      const content = await generateContentForLocale(
        metaCopies,
        locale,
        brandContext
      );

      // Validate structure
      validateGeneratedContent(metaCopies, content, locale);

      // Write file
      const filePath = writeTranslationFile(copiesDir, locale, content);
      generatedFiles.push(filePath);
    }

    // 8. Detect and validate namespace
    const namespace = detectNamespace(absoluteTarget);
    validateNamespace(absoluteTarget, namespace);

    // 9. Display success
    displaySuccess(copiesDir, namespace, generatedFiles);

    process.exit(0);
  } catch (error) {
    handleError(error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateContentForLocale, buildPrompt };
