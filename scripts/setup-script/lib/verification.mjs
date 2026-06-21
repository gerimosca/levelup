/**
 * Verification system for setup steps
 * Auto-detects what's already configured
 */

import {
  hasCommand,
  checkNodeVersion,
  fileExists,
  hasEnvVar,
  runCommand,
  PROJECT_ROOT,
} from './utils.mjs';
import fs from 'fs';
import path from 'path';

/**
 * Verify Node.js version (>= 20)
 */
export function verifyNodeVersion() {
  const version = checkNodeVersion();
  return {
    passed: version >= 20,
    message: version >= 20 ? `Node.js v${version} ✓` : `Node.js v${version} (needs v20+)`,
    version,
  };
}

/**
 * Verify Supabase CLI
 */
export function verifySupabaseCLI() {
  const exists = hasCommand('supabase');
  return {
    passed: exists,
    message: exists ? 'Supabase CLI installed ✓' : 'Supabase CLI not found',
  };
}

/**
 * Verify Stripe CLI
 */
export function verifyStripeCLI() {
  const exists = hasCommand('stripe');
  return {
    passed: exists,
    message: exists ? 'Stripe CLI installed ✓' : 'Stripe CLI not found',
  };
}

/**
 * Verify npm dependencies installed
 */
export function verifyDependencies() {
  const exists = fileExists('node_modules');
  return {
    passed: exists,
    message: exists ? 'Dependencies installed ✓' : 'Dependencies not installed',
  };
}

/**
 * Verify .env.local file exists and has required vars
 */
export function verifyEnvFile() {
  if (!fileExists('.env.local')) {
    return {
      passed: false,
      message: '.env.local not found',
      missing: 'all',
    };
  }

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missing = required.filter((key) => !hasEnvVar(key));

  return {
    passed: missing.length === 0,
    message:
      missing.length === 0
        ? 'Environment variables configured ✓'
        : `Missing: ${missing.join(', ')}`,
    missing,
  };
}

/**
 * Verify Supabase project is linked
 */
export function verifySupabaseLinked() {
  // Check both possible locations
  const hiddenExists = fileExists('.supabase/config.toml');
  const publicExists = fileExists('supabase/config.toml');
  const exists = hiddenExists || publicExists;

  return {
    passed: exists,
    message: exists ? 'Supabase project linked ✓' : 'Supabase project not linked',
  };
}

/**
 * Verify database migrations applied
 */
export function verifyMigrationsApplied() {
  // Check if types are generated (proxy for migrations applied)
  const typesExist = fileExists('src/types/database.types.ts');

  if (!typesExist) {
    return {
      passed: false,
      message: 'Migrations not applied (types missing)',
    };
  }

  // Additional check: verify essential tables exist in types
  try {
    const typesPath = path.join(PROJECT_ROOT, 'src/types/database.types.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');

    const essentialTables = ['profiles', 'subscriptions', 'app_settings'];
    const allPresent = essentialTables.every((table) => content.includes(`"${table}"`));

    return {
      passed: allPresent,
      message: allPresent ? 'Migrations applied ✓' : 'Some migrations missing',
    };
  } catch {
    return {
      passed: false,
      message: 'Cannot verify migrations',
    };
  }
}

/**
 * Verify TypeScript types generated
 */
export function verifyTypesGenerated() {
  const exists = fileExists('src/types/database.types.ts');
  return {
    passed: exists,
    message: exists ? 'TypeScript types generated ✓' : 'Types not generated',
  };
}

/**
 * Verify brand configuration
 */
export function verifyBrandConfig() {
  try {
    const brandPath = path.join(PROJECT_ROOT, 'src/core/shared/config/brand.ts');
    const content = fs.readFileSync(brandPath, 'utf-8');

    // Check if it's still default (AI SaaS)
    const isDefault = content.includes("name: 'AI SaaS'");

    return {
      passed: !isDefault,
      message: isDefault ? 'Brand config not customized' : 'Brand configured ✓',
      isDefault,
    };
  } catch {
    return {
      passed: false,
      message: 'Cannot read brand config',
    };
  }
}

/**
 * Verify custom colors
 */
export function verifyCustomColors() {
  try {
    const cssPath = path.join(PROJECT_ROOT, 'src/app/[locale]/globals.css');
    const content = fs.readFileSync(cssPath, 'utf-8');

    // Check for custom primary color (not default)
    // Default is usually hsl(222.2 47.4% 11.2%)
    const hasCustomPrimary = !content.includes('222.2 47.4% 11.2%');

    return {
      passed: hasCustomPrimary,
      message: hasCustomPrimary ? 'Custom colors configured ✓' : 'Using default colors',
    };
  } catch {
    return {
      passed: false,
      message: 'Cannot verify colors',
    };
  }
}

/**
 * Verify custom assets (logo, favicon)
 */
export function verifyAssets() {
  const hasLogo = fileExists('public/logo.svg');
  const hasFavicon = fileExists('public/favicon.ico');

  const passed = hasLogo && hasFavicon;

  return {
    passed,
    message: passed ? 'Assets configured ✓' : 'Default assets',
    hasLogo,
    hasFavicon,
  };
}

/**
 * Verify SEO pages exist
 */
export function verifySEOPages() {
  const hasForPages = fileExists('src/app/[locale]/(marketing)/for');
  const hasAlternativePage = fileExists('src/app/[locale]/(marketing)/alternative');

  const passed = hasForPages || hasAlternativePage;

  return {
    passed,
    message: passed ? 'SEO pages exist ✓' : 'No SEO pages generated',
  };
}

/**
 * Verify Stripe webhook secret
 */
export function verifyStripeWebhook() {
  const exists = hasEnvVar('STRIPE_WEBHOOK_SECRET');
  return {
    passed: exists,
    message: exists ? 'Stripe webhook configured ✓' : 'Stripe webhook not configured',
  };
}

/**
 * Verify Stripe pricing table
 */
export function verifyStripePricingTable() {
  const exists = hasEnvVar('NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID');
  return {
    passed: exists,
    message: exists ? 'Pricing table configured ✓' : 'Pricing table not configured',
  };
}

/**
 * Verify Resend API key
 */
export function verifyResendAPI() {
  const exists = hasEnvVar('RESEND_API_KEY');
  return {
    passed: exists,
    message: exists ? 'Resend API configured ✓' : 'Resend not configured',
  };
}

/**
 * Verify Sentry DSN
 */
export function verifySentry() {
  const exists = hasEnvVar('SENTRY_DSN');
  return {
    passed: exists,
    message: exists ? 'Sentry configured ✓' : 'Sentry not configured',
  };
}

/**
 * Verify legal pages customized
 */
export function verifyLegalPages() {
  try {
    // Check privacy page for placeholder text
    const privacyPath = path.join(
      PROJECT_ROOT,
      'src/app/[locale]/(marketing)/privacy/page.tsx'
    );

    if (!fs.existsSync(privacyPath)) {
      return { passed: false, message: 'Privacy page missing' };
    }

    const content = fs.readFileSync(privacyPath, 'utf-8');

    // Check if it still has placeholder text
    const hasPlaceholder =
      content.includes('[Your Company]') || content.includes('[Company Name]');

    return {
      passed: !hasPlaceholder,
      message: hasPlaceholder ? 'Legal pages not customized' : 'Legal pages customized ✓',
    };
  } catch {
    return {
      passed: false,
      message: 'Cannot verify legal pages',
    };
  }
}

/**
 * Verify GDPR/Iubenda
 */
export function verifyGDPR() {
  const exists = hasEnvVar('NEXT_PUBLIC_IUBENDA_PRIVACY_URL');
  return {
    passed: exists,
    message: exists ? 'GDPR compliance configured ✓' : 'GDPR not configured',
  };
}

/**
 * Run all verifications for a step
 */
export function verifyStep(stepId) {
  const verifiers = {
    'check-node': verifyNodeVersion,
    'check-supabase-cli': verifySupabaseCLI,
    'check-stripe-cli': verifyStripeCLI,
    'install-deps': verifyDependencies,
    'setup-env': verifyEnvFile,
    'link-supabase': verifySupabaseLinked,
    'run-migrations': verifyMigrationsApplied,
    'generate-types': verifyTypesGenerated,
    'brand-config': verifyBrandConfig,
    'color-palette': verifyCustomColors,
    assets: verifyAssets,
    'landing-copy': verifyLandingCopy,
    'seo-pages': verifySEOPages,
    'stripe-webhooks': verifyStripeWebhook,
    'stripe-pricing-table': verifyStripePricingTable,
    'email-provider': verifyResendAPI,
    sentry: verifySentry,
    'legal-pages': verifyLegalPages,
    'gdpr-setup': verifyGDPR,
  };

  const verifier = verifiers[stepId];
  if (!verifier) {
    return { passed: false, message: 'No verification available' };
  }

  return verifier();
}

/**
 * Run verifications for all steps and update state
 */
export function runFullVerification(categories, state) {
  categories.forEach((category) => {
    category.steps.forEach((step) => {
      if (step.type === 'automated' && step.verification) {
        const result = verifyStep(step.id);

        if (result.passed) {
          // Auto-complete if verification passes
          if (!state.categories[category.id]) {
            state.categories[category.id] = {
              status: 'pending',
              completedSteps: 0,
              totalSteps: category.steps.length,
              steps: {},
            };
          }

          state.categories[category.id].steps[step.id] = {
            status: 'completed',
            timestamp: new Date().toISOString(),
            autoDetected: true,
          };
        }
      }
    });
  });

  return state;
}

/**
 * Verify landing pages copy is customized
 */
export function verifyLandingCopy() {
  try {
    const messagesPath = path.join(PROJECT_ROOT, 'messages/en.json');
    if (!fs.existsSync(messagesPath)) {
      return { passed: false, reason: 'messages/en.json not found' };
    }

    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));

    // Check for generic content
    const genericTerms = ['AI SaaS', 'Build faster with AI', 'Build Your SaaS Faster'];

    function hasGenericTerm(obj) {
      for (const value of Object.values(obj)) {
        if (typeof value === 'string') {
          if (genericTerms.some((term) => value.includes(term))) {
            return true;
          }
        } else if (typeof value === 'object' && value !== null) {
          if (hasGenericTerm(value)) {
            return true;
          }
        }
      }
      return false;
    }

    const hasGeneric = hasGenericTerm(messages);

    if (hasGeneric) {
      return {
        passed: false,
        reason: 'Landing pages contain generic copy',
      };
    }

    return { passed: true };
  } catch (error) {
    return { passed: false, reason: `Error checking copy: ${error.message}` };
  }
}
