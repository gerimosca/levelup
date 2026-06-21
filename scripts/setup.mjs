#!/usr/bin/env node

/**
 * Interactive setup wizard for SaaS Boilerplate
 * Run with: npm run setup
 */

import { createInterface } from 'readline';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for terminal output
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
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${'='.repeat(50)}\n  ${msg}\n${'='.repeat(50)}${colors.reset}\n`),
};

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const confirm = async (prompt, defaultYes = true) => {
  const suffix = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await question(`${prompt} ${suffix}: `);
  if (!answer) return defaultYes;
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
};

// Check if command exists
const commandExists = (cmd) => {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Parse command line flags
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);

// Flag-specific setup functions
async function setupEnvOnly() {
  log.title('Environment Variables Setup');

  const envPath = join(rootDir, '.env.local');
  const envExamplePath = join(rootDir, '.env');

  let envContent = '';

  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
    log.info('Updating existing .env.local');
  } else if (existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    envContent = readFileSync(envPath, 'utf-8');
    log.success('Created .env.local from .env');
  }

  const updateEnv = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  };

  const getEnvValue = (key) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1] : '';
  };

  console.log('\n');
  log.info('Enter your Supabase credentials (from Project Settings → API):');

  let supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
  const inputUrl = await question(`  Supabase URL ${supabaseUrl ? `[${supabaseUrl}]` : ''}: `);
  if (inputUrl) supabaseUrl = inputUrl;
  updateEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);

  let supabaseAnonKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const inputAnonKey = await question(`  Supabase Anon Key ${supabaseAnonKey ? '[****]' : ''}: `);
  if (inputAnonKey) supabaseAnonKey = inputAnonKey;
  updateEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);

  let supabaseServiceKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
  const inputServiceKey = await question(`  Supabase Service Role Key ${supabaseServiceKey ? '[****]' : ''}: `);
  if (inputServiceKey) supabaseServiceKey = inputServiceKey;
  updateEnv('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceKey);

  console.log('\n');
  log.info('Enter your Stripe credentials (from Stripe Dashboard → Developers → API keys):');

  let stripePublishable = getEnvValue('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  const inputStripePub = await question(`  Stripe Publishable Key ${stripePublishable ? '[****]' : ''}: `);
  if (inputStripePub) stripePublishable = inputStripePub;
  updateEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', stripePublishable);

  let stripeSecret = getEnvValue('STRIPE_SECRET_KEY');
  const inputStripeSecret = await question(`  Stripe Secret Key ${stripeSecret ? '[****]' : ''}: `);
  if (inputStripeSecret) stripeSecret = inputStripeSecret;
  updateEnv('STRIPE_SECRET_KEY', stripeSecret);

  console.log('\n');
  log.info('Stripe Pricing Table ID (from Product Catalog → Pricing tables):');

  let stripePricingTable = getEnvValue('NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID');
  const inputPricingTable = await question(`  Pricing Table ID ${stripePricingTable ? `[${stripePricingTable}]` : ''}: `);
  if (inputPricingTable) stripePricingTable = inputPricingTable;
  updateEnv('NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID', stripePricingTable);

  let appUrl = getEnvValue('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
  updateEnv('NEXT_PUBLIC_APP_URL', appUrl);

  writeFileSync(envPath, envContent);
  log.success('Environment variables saved to .env.local');
  console.log('');
}

async function setupBrandOnly() {
  log.title('Brand Configuration');

  const brandPath = join(rootDir, 'src/core/shared/config/brand.ts');
  if (!existsSync(brandPath)) {
    log.error('Brand file not found at src/core/shared/config/brand.ts');
    return;
  }

  let brandContent = readFileSync(brandPath, 'utf-8');

  console.log('\n');
  log.info('Enter your brand details:');
  const brandName = await question(`  Product name [AI SaaS]: `) || 'AI SaaS';
  const tagline = await question(`  Tagline [Build faster with AI]: `) || 'Build faster with AI';
  const websiteUrl = await question(`  Production URL [https://example.com]: `) || 'https://example.com';

  const defaultDesc = 'Production-ready SaaS boilerplate with authentication, payments, and everything you need to launch quickly.';
  const metaDescription = await question(`  Meta description (max 160 chars)\n  [${defaultDesc.substring(0, 50)}...]: `) || defaultDesc;

  console.log('\n');
  log.info('Social links (press Enter to skip):');
  const twitterUrl = await question('  Twitter/X URL: ');
  const githubUrl = await question('  GitHub URL: ');
  const linkedinUrl = await question('  LinkedIn URL: ');

  brandContent = brandContent.replace(/name: 'AI SaaS'/, `name: '${brandName}'`);
  brandContent = brandContent.replace(/tagline: 'Build faster with AI'/, `tagline: '${tagline}'`);
  brandContent = brandContent.replace(/website: 'https:\/\/example\.com'/, `website: '${websiteUrl}'`);
  brandContent = brandContent.replace(/defaultDescription:\s*\n?\s*'[^']*'/, `defaultDescription:\n      '${metaDescription}'`);
  brandContent = brandContent.replace(/titleTemplate: '%s \| AI SaaS'/, `titleTemplate: '%s | ${brandName}'`);
  brandContent = brandContent.replace(/defaultTitle: 'AI SaaS - Build faster with AI'/, `defaultTitle: '${brandName} - ${tagline}'`);

  if (twitterUrl) brandContent = brandContent.replace(/twitter: ''/, `twitter: '${twitterUrl}'`);
  if (githubUrl) brandContent = brandContent.replace(/github: ''/, `github: '${githubUrl}'`);
  if (linkedinUrl) brandContent = brandContent.replace(/linkedin: ''/, `linkedin: '${linkedinUrl}'`);

  brandContent = brandContent.replace(/AI SaaS\. All rights reserved/, `${brandName}. All rights reserved`);

  try {
    const domain = new URL(websiteUrl).hostname.replace('www.', '');
    brandContent = brandContent.replace(/support: 'support@example\.com'/, `support: 'support@${domain}'`);
  } catch {
    // Keep default if URL parsing fails
  }

  writeFileSync(brandPath, brandContent);
  log.success('Brand configuration saved');
  console.log('');
}

async function setupStripeWebhookOnly() {
  log.title('Stripe Webhook Setup');

  if (!commandExists('stripe')) {
    log.error('Stripe CLI not found. Please install it first:');
    console.log('  brew install stripe/stripe-cli/stripe');
    return;
  }

  const envPath = join(rootDir, '.env.local');
  if (!existsSync(envPath)) {
    log.error('.env.local not found. Please run environment setup first.');
    return;
  }

  console.log('\n');
  log.info('Starting Stripe webhook listener...');
  log.info('Copy the webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET\n');

  const stripeProcess = spawn('stripe', ['listen', '--forward-to', 'localhost:3000/api/webhooks/stripe'], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n');
  const webhookSecret = await question('  Enter the webhook signing secret (whsec_...): ');
  if (webhookSecret) {
    let envContent = readFileSync(envPath, 'utf-8');
    if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
      envContent = envContent.replace(/STRIPE_WEBHOOK_SECRET=.*/, `STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
    } else {
      envContent += `\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}`;
    }
    writeFileSync(envPath, envContent);
    log.success('Webhook secret saved');
  }

  stripeProcess.kill();
  console.log('');
}

async function setupSentryOnly() {
  log.title('Sentry Error Tracking Setup');

  const envPath = join(rootDir, '.env.local');
  if (!existsSync(envPath)) {
    log.error('.env.local not found. Please run environment setup first.');
    return;
  }

  console.log('\n');
  log.info('Installing @sentry/nextjs...');
  try {
    execSync('npm install @sentry/nextjs', { cwd: rootDir, stdio: 'inherit' });
    log.success('@sentry/nextjs installed');

    console.log('\n');
    const sentryDsn = await question('  Sentry DSN (from sentry.io): ');
    if (sentryDsn) {
      let envContent = readFileSync(envPath, 'utf-8');
      if (envContent.includes('SENTRY_DSN=')) {
        envContent = envContent.replace(/SENTRY_DSN=.*/, `SENTRY_DSN=${sentryDsn}`);
      } else {
        envContent += `\nSENTRY_DSN=${sentryDsn}`;
      }
      if (envContent.includes('NEXT_PUBLIC_SENTRY_DSN=')) {
        envContent = envContent.replace(/NEXT_PUBLIC_SENTRY_DSN=.*/, `NEXT_PUBLIC_SENTRY_DSN=${sentryDsn}`);
      } else {
        envContent += `\nNEXT_PUBLIC_SENTRY_DSN=${sentryDsn}`;
      }
      writeFileSync(envPath, envContent);
      log.success('Sentry DSN saved to .env.local');

      log.info('Running Sentry wizard...');
      execSync('npx @sentry/wizard@latest -i nextjs --skip-connect', { cwd: rootDir, stdio: 'inherit' });
    }
  } catch (error) {
    log.warn('Sentry setup failed. You can configure manually later.');
    log.info('  npm install @sentry/nextjs');
    log.info('  npx @sentry/wizard@latest -i nextjs');
  }
  console.log('');
}

// Main setup function
async function setup() {
  log.title('SaaS Boilerplate Setup Wizard');

  // Step 0: Pre-Setup Checklist
  console.log('');
  log.info('⏱️  Total setup time: ~30-40 minutes');
  console.log('   • Accounts setup: ~20-30 min (one-time)');
  console.log('   • Configuration: ~10 min\n');

  log.step('Pre-Setup Checklist');
  console.log('');
  console.log(`${colors.bright}You need accounts on these platforms:${colors.reset}\n`);

  console.log(`${colors.green}✅ REQUIRED${colors.reset} (app won't work without these):\n`);
  console.log('  1. Supabase - Database + Authentication');
  console.log('     → https://supabase.com/dashboard/sign-up');
  console.log('     → Time: ~5 minutes\n');

  console.log('  2. Stripe - Payments + Subscriptions');
  console.log('     → https://dashboard.stripe.com/register');
  console.log('     → Time: ~10-15 minutes\n');

  console.log(`${colors.cyan}⭐ RECOMMENDED${colors.reset} (can skip, but features won't work):\n`);
  console.log('  3. Resend - Transactional emails');
  console.log('     → https://resend.com/signup');
  console.log('     → Time: ~5 minutes\n');

  console.log('  4. Sentry - Error tracking');
  console.log('     → https://sentry.io/signup/');
  console.log('     → Time: ~5 minutes\n');

  const hasAccounts = await confirm('Do you have Supabase and Stripe accounts ready?', false);

  if (!hasAccounts) {
    console.log('\n');
    log.info('No problem! Here\'s what to do:\n');
    console.log('1. Create accounts on these platforms:');
    console.log('   • Supabase: https://supabase.com/dashboard/sign-up');
    console.log('   • Stripe: https://dashboard.stripe.com/register\n');
    console.log('2. Create your first project on each platform\n');
    console.log('3. Come back and run: npm run setup\n');

    const openLinks = await confirm('Open signup links in browser now?');
    if (openLinks) {
      try {
        execSync('open https://supabase.com/dashboard/sign-up', { stdio: 'ignore' });
        await new Promise(resolve => setTimeout(resolve, 500));
        execSync('open https://dashboard.stripe.com/register', { stdio: 'ignore' });
        log.success('Links opened in browser');
      } catch {
        log.info('Could not open browser. Please visit the links manually.');
      }
    }

    console.log('\n');
    log.info('Run "npm run setup" when you\'re ready!\n');
    rl.close();
    process.exit(0);
  }

  log.success('Great! Let\'s continue with the setup.\n');

  // Step 1: Check prerequisites
  log.step('Checking prerequisites...');

  // Check Node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 20) {
    log.error(`Node.js 20+ required. You have ${nodeVersion}`);
    console.log('\n  To fix this, run:\n');
    console.log('  # Using nvm (recommended):');
    console.log('  nvm install 20');
    console.log('  nvm use 20');
    console.log('\n  # Or using brew:');
    console.log('  brew install node@20');
    console.log('\n  Then run npm run setup again.\n');
    process.exit(1);
  }
  log.success(`Node.js ${nodeVersion}`);

  // Check npm
  if (!commandExists('npm')) {
    log.error('npm not found');
    process.exit(1);
  }
  log.success('npm installed');

  // Check Supabase CLI
  const hasSupabase = commandExists('supabase') || commandExists('npx');
  if (!hasSupabase) {
    log.warn('Supabase CLI not found. Will use npx.');
  } else {
    log.success('Supabase CLI available');
  }

  // Check Stripe CLI
  const hasStripe = commandExists('stripe');
  if (!hasStripe) {
    log.warn('Stripe CLI not found. Install with: brew install stripe/stripe-cli/stripe');
  } else {
    log.success('Stripe CLI installed');
  }

  // Check Claude Code CLI
  const hasClaude = commandExists('claude');
  if (!hasClaude) {
    log.warn('Claude Code not installed (recommended for this boilerplate)');
    log.info('  Install: npm install -g @anthropic-ai/claude-code');
  } else {
    log.success('Claude Code installed');
  }

  // Step 2: Install dependencies
  log.step('Installing dependencies...');

  const nodeModulesExists = existsSync(join(rootDir, 'node_modules'));
  if (!nodeModulesExists) {
    log.info('Running npm install...');
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    log.success('Dependencies installed');
  } else {
    log.success('Dependencies already installed');
  }

  // Step 3: Setup environment variables
  log.step('Setting up environment variables...');

  const envPath = join(rootDir, '.env.local');
  const envExamplePath = join(rootDir, '.env');

  let envContent = '';

  if (existsSync(envPath)) {
    const overwrite = await confirm('.env.local already exists. Overwrite?', false);
    if (!overwrite) {
      log.info('Keeping existing .env.local');
      envContent = readFileSync(envPath, 'utf-8');
    } else {
      envContent = existsSync(envExamplePath) ? readFileSync(envExamplePath, 'utf-8') : '';
    }
  } else if (existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    envContent = readFileSync(envPath, 'utf-8');
    log.success('Created .env.local from .env');
  }

  // Helper to update env var
  const updateEnv = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  };

  // Get current env values
  const getEnvValue = (key) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1] : '';
  };

  console.log('\n');
  log.info('Enter your Supabase credentials (from Project Settings → API):');

  let supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
  const inputUrl = await question(`  Supabase URL ${supabaseUrl ? `[${supabaseUrl}]` : ''}: `);
  if (inputUrl) supabaseUrl = inputUrl;
  updateEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);

  let supabaseAnonKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const inputAnonKey = await question(`  Supabase Anon Key ${supabaseAnonKey ? '[****]' : ''}: `);
  if (inputAnonKey) supabaseAnonKey = inputAnonKey;
  updateEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);

  let supabaseServiceKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
  const inputServiceKey = await question(`  Supabase Service Role Key ${supabaseServiceKey ? '[****]' : ''}: `);
  if (inputServiceKey) supabaseServiceKey = inputServiceKey;
  updateEnv('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceKey);

  console.log('\n');
  log.info('Enter your Stripe credentials (from Stripe Dashboard → Developers → API keys):');

  let stripePublishable = getEnvValue('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  const inputStripePub = await question(`  Stripe Publishable Key ${stripePublishable ? '[****]' : ''}: `);
  if (inputStripePub) stripePublishable = inputStripePub;
  updateEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', stripePublishable);

  let stripeSecret = getEnvValue('STRIPE_SECRET_KEY');
  const inputStripeSecret = await question(`  Stripe Secret Key ${stripeSecret ? '[****]' : ''}: `);
  if (inputStripeSecret) stripeSecret = inputStripeSecret;
  updateEnv('STRIPE_SECRET_KEY', stripeSecret);

  console.log('\n');
  log.info('Stripe Pricing Table ID (from Product Catalog → Pricing tables):');

  let stripePricingTable = getEnvValue('NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID');
  const inputPricingTable = await question(`  Pricing Table ID ${stripePricingTable ? `[${stripePricingTable}]` : ''}: `);
  if (inputPricingTable) stripePricingTable = inputPricingTable;
  updateEnv('NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID', stripePricingTable);

  // App URL
  let appUrl = getEnvValue('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
  updateEnv('NEXT_PUBLIC_APP_URL', appUrl);

  // Save env file
  writeFileSync(envPath, envContent);
  log.success('Environment variables saved to .env.local');

  // Step 4: Brand & SEO Configuration
  log.step('Configuring brand and SEO settings...');

  const brandPath = join(rootDir, 'src/core/shared/config/brand.ts');
  let brandContent = readFileSync(brandPath, 'utf-8');

  console.log('\n');
  const configureBrand = await confirm('Configure brand and SEO settings now?', true);

  if (configureBrand) {
    let brandName, tagline, websiteUrl, metaDescription;
    let twitterUrl = '', githubUrl = '', linkedinUrl = '';
    let allowAIBots = true;

    // Offer AI generation if Claude is available
    if (hasClaude) {
      const useAI = await confirm('Use Claude to generate brand content from your business description?', true);

      if (useAI) {
        console.log('\n');
        const businessDescription = await question('  Describe your business in 2-3 sentences:\n  > ');

        if (businessDescription) {
          log.info('Generating brand content with Claude...');

          try {
            const prompt = `Based on this business description, generate brand content for a SaaS product.

Business: ${businessDescription}

Return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "name": "short product name (2-3 words max)",
  "tagline": "catchy tagline (5-8 words)",
  "metaDescription": "SEO meta description (max 155 chars)",
  "websiteUrl": "https://example.com"
}`;

            const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
              encoding: 'utf-8',
              cwd: rootDir,
              timeout: 30000
            });

            // Extract JSON from response
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const generated = JSON.parse(jsonMatch[0]);
              brandName = generated.name || 'AI SaaS';
              tagline = generated.tagline || 'Build faster with AI';
              metaDescription = generated.metaDescription || '';
              websiteUrl = generated.websiteUrl || 'https://example.com';

              console.log('\n');
              log.success('Generated brand content:');
              console.log(`  Name: ${brandName}`);
              console.log(`  Tagline: ${tagline}`);
              console.log(`  Description: ${metaDescription}`);
              console.log('\n');

              const acceptGenerated = await confirm('Use this generated content?', true);
              if (!acceptGenerated) {
                brandName = null; // Will fall through to manual input
              }
            }
          } catch (error) {
            log.warn('Could not generate with Claude. Falling back to manual input.');
            log.info(`Error: ${error.message}`);
          }
        }
      }
    }

    // Manual input if not generated or generation failed
    if (!brandName) {
      console.log('\n');
      log.info('Enter your brand details:');
      brandName = await question(`  Product name [AI SaaS]: `) || 'AI SaaS';
      tagline = await question(`  Tagline [Build faster with AI]: `) || 'Build faster with AI';
      websiteUrl = await question(`  Production URL [https://example.com]: `) || 'https://example.com';

      const defaultDesc = 'Production-ready SaaS boilerplate with authentication, payments, and everything you need to launch quickly.';
      metaDescription = await question(`  Meta description (max 160 chars)\n  [${defaultDesc.substring(0, 50)}...]: `) || defaultDesc;
    }

    // Always ask for social links and AI bots
    console.log('\n');
    log.info('Social links (press Enter to skip):');
    twitterUrl = await question('  Twitter/X URL: ');
    githubUrl = await question('  GitHub URL: ');
    linkedinUrl = await question('  LinkedIn URL: ');

    console.log('\n');
    log.info('Founders & Team (optional, press Enter to skip):');
    console.log('  This will populate the About page team section.');
    const founders = [];
    const addFounders = await confirm('  Add founder names?', false);
    if (addFounders) {
      let addMore = true;
      while (addMore && founders.length < 10) {
        const founderName = await question(`  Founder ${founders.length + 1} name (or press Enter to finish): `);
        if (!founderName) break;
        founders.push(founderName.trim());
        if (founders.length < 10) {
          addMore = await confirm('  Add another founder?', false);
        }
      }
    }

    console.log('\n');
    log.info('AI Search Optimization (GEO):');
    allowAIBots = await confirm('  Allow AI bots to crawl your site (GPTBot, ClaudeBot, etc)?', true);

    // Update brand.ts with new values
    brandContent = brandContent.replace(/name: 'AI SaaS'/, `name: '${brandName}'`);
    brandContent = brandContent.replace(/tagline: 'Build faster with AI'/, `tagline: '${tagline}'`);
    brandContent = brandContent.replace(/website: 'https:\/\/example\.com'/, `website: '${websiteUrl}'`);
    brandContent = brandContent.replace(/defaultDescription:\s*\n?\s*'[^']*'/, `defaultDescription:\n      '${metaDescription}'`);
    brandContent = brandContent.replace(/titleTemplate: '%s \| AI SaaS'/, `titleTemplate: '%s | ${brandName}'`);
    brandContent = brandContent.replace(/defaultTitle: 'AI SaaS - Build faster with AI'/, `defaultTitle: '${brandName} - ${tagline}'`);

    if (twitterUrl) brandContent = brandContent.replace(/twitter: ''/, `twitter: '${twitterUrl}'`);
    if (githubUrl) brandContent = brandContent.replace(/github: ''/, `github: '${githubUrl}'`);
    if (linkedinUrl) brandContent = brandContent.replace(/linkedin: ''/, `linkedin: '${linkedinUrl}'`);

    if (founders.length > 0) {
      const foundersArray = `[${founders.map(name => `'${name}'`).join(', ')}]`;
      brandContent = brandContent.replace(/founders: \[\] as string\[\]/, `founders: ${foundersArray} as string[]`);
    }

    brandContent = brandContent.replace(/allowAIBots: true/, `allowAIBots: ${allowAIBots}`);
    brandContent = brandContent.replace(/AI SaaS\. All rights reserved/, `${brandName}. All rights reserved`);

    try {
      const domain = new URL(websiteUrl).hostname.replace('www.', '');
      brandContent = brandContent.replace(/support: 'support@example\.com'/, `support: 'support@${domain}'`);
    } catch {
      // Keep default if URL parsing fails
    }

    writeFileSync(brandPath, brandContent);
    log.success('Brand configuration saved to src/core/shared/config/brand.ts');
  } else {
    log.info('Skipped. You can configure brand settings later in src/core/shared/config/brand.ts');
  }

  // Step 5: Configure Colors
  log.step('Configuring brand colors...');

  console.log('\n');
  log.info('Choose your brand colors or use AI to suggest based on your industry.');
  console.log('Recommended to personalize your brand.\n');

  const setupColors = await confirm('Configure brand colors now?', true);
  if (setupColors) {
    try {
      execSync('node scripts/generators/colors.mjs', { cwd: rootDir, stdio: 'inherit' });
      log.success('Colors configured');
    } catch (error) {
      log.warn('Skipped. Run manually: node scripts/generators/colors.mjs');
    }
  } else {
    console.log('\n');
    log.info('Using default blue color scheme. Configure later: node scripts/generators/colors.mjs\n');
  }

  // Step 6: Configure Assets
  log.step('Configuring brand assets...');

  console.log('\n');
  log.info('Generate placeholder logo/icon or provide your own files.');
  console.log('Recommended to have a recognizable brand.\n');

  const setupAssets = await confirm('Configure logo, favicon, and OG image now?', true);
  if (setupAssets) {
    try {
      execSync('node scripts/generators/assets.mjs', { cwd: rootDir, stdio: 'inherit' });
      log.success('Assets configured');
    } catch (error) {
      log.warn('Skipped. Run manually: node scripts/generators/assets.mjs');
    }
  } else {
    console.log('\n');
    log.info('Using placeholder assets. Configure later: node scripts/generators/assets.mjs\n');
  }

  // Step 7: Adapt Landing Copy
  log.step('Adapting landing page to your business...');

  console.log('\n');
  log.info('Use AI to adapt landing page copy to your specific business.');
  console.log('Makes your landing page more relevant to your audience.\n');

  const adaptLanding = await confirm('Adapt landing page copy to your business?', true);
  if (adaptLanding) {
    try {
      execSync('node scripts/generators/landing.mjs', { cwd: rootDir, stdio: 'inherit' });
      log.success('Landing copy adapted');
    } catch (error) {
      log.warn('Skipped. Run manually: node scripts/generators/landing.mjs');
    }
  } else {
    console.log('\n');
    log.info('Using generic landing copy. Configure later: node scripts/generators/landing.mjs\n');
  }

  // Step 8: Customize Legal Pages
  log.step('Customizing Privacy Policy and Terms...');

  console.log('\n');
  log.info('Add your company details to Privacy Policy and Terms of Service.');
  log.warn('⚠️  IMPORTANT: Legal templates need your real data before production!\n');

  const customizeLegal = await confirm('Customize legal pages with your company data?', true);
  if (customizeLegal) {
    try {
      execSync('node scripts/generators/legal.mjs', { cwd: rootDir, stdio: 'inherit' });
      log.success('Legal pages customized');
    } catch (error) {
      log.warn('Skipped. Run manually: node scripts/generators/legal.mjs');
    }
  } else {
    console.log('\n');
    log.warn('⚠️  Using template legal pages. MUST customize before production!');
    log.info('Configure later: node scripts/generators/legal.mjs\n');
  }

  // Step 9: Setup Error Tracking (Sentry)
  log.step('Configuring error tracking with Sentry...');

  console.log('\n');
  log.info('Sentry tracks errors in production and helps you fix bugs faster.');
  console.log('Recommended but optional. You can skip and configure later.\n');

  const setupSentry = await confirm('Configure Sentry for error tracking?');
  if (setupSentry) {
    log.info('Installing @sentry/nextjs...');
    try {
      execSync('npm install @sentry/nextjs', { cwd: rootDir, stdio: 'inherit' });
      log.success('@sentry/nextjs installed');

      console.log('\n');
      const sentryDsn = await question('  Sentry DSN (from sentry.io): ');
      if (sentryDsn) {
        envContent = readFileSync(envPath, 'utf-8');
        if (envContent.includes('SENTRY_DSN=')) {
          envContent = envContent.replace(/SENTRY_DSN=.*/, `SENTRY_DSN=${sentryDsn}`);
        } else {
          envContent += `\nSENTRY_DSN=${sentryDsn}`;
        }
        if (envContent.includes('NEXT_PUBLIC_SENTRY_DSN=')) {
          envContent = envContent.replace(/NEXT_PUBLIC_SENTRY_DSN=.*/, `NEXT_PUBLIC_SENTRY_DSN=${sentryDsn}`);
        } else {
          envContent += `\nNEXT_PUBLIC_SENTRY_DSN=${sentryDsn}`;
        }
        writeFileSync(envPath, envContent);
        log.success('Sentry DSN saved to .env.local');

        log.info('Running Sentry wizard...');
        execSync('npx @sentry/wizard@latest -i nextjs --skip-connect', { cwd: rootDir, stdio: 'inherit' });
      }
    } catch (error) {
      log.warn('Sentry setup failed. You can configure manually later.');
      log.info('  npm install @sentry/nextjs');
      log.info('  npx @sentry/wizard@latest -i nextjs');
    }
  } else {
    console.log('\n');
    log.warn('⚠️  WARNING: Error tracking is disabled.');
    log.info('Production errors will not be monitored.');
    log.info('Configure later: npm install @sentry/nextjs && npx @sentry/wizard -i nextjs\n');
  }

  // Step 10: Setup Email (Resend)
  log.step('Configuring transactional email with Resend...');

  console.log('\n');
  log.info('Resend handles transactional emails (welcome, password reset, etc.).');
  console.log('Recommended but optional. You can skip and configure later.\n');

  const setupEmail = await confirm('Configure Resend for transactional emails?');
  if (setupEmail) {
    try {
      execSync('node scripts/generators/email.mjs', { cwd: rootDir, stdio: 'inherit' });
      log.success('Email system configured');
    } catch (error) {
      log.warn('Email setup failed. Run manually: node scripts/generators/email.mjs');
    }
  } else {
    console.log('\n');
    log.warn('⚠️  WARNING: Email functionality is disabled.');
    log.info('Users will not receive welcome emails, password resets, etc.');
    log.info('Configure later: node scripts/generators/email.mjs\n');
  }

  // Step 11: Setup Stripe webhook for local testing
  log.step('Setting up Stripe webhooks for local testing...');

  if (hasStripe) {
    const setupStripeWebhook = await confirm('Start Stripe CLI webhook listener?');
    if (setupStripeWebhook) {
      log.info('Starting Stripe webhook listener...');
      log.info('Copy the webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET\n');

      const stripeProcess = spawn('stripe', ['listen', '--forward-to', 'localhost:3000/api/webhooks/stripe'], {
        cwd: rootDir,
        stdio: 'inherit',
      });

      // Wait a moment for the webhook secret to display
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('\n');
      const webhookSecret = await question('  Enter the webhook signing secret (whsec_...): ');
      if (webhookSecret) {
        envContent = readFileSync(envPath, 'utf-8');
        if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
          envContent = envContent.replace(/STRIPE_WEBHOOK_SECRET=.*/, `STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
        } else {
          envContent += `\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}`;
        }
        writeFileSync(envPath, envContent);
        log.success('Webhook secret saved');
      }

      // Keep Stripe listener running in background
      stripeProcess.unref();
      log.info('Stripe webhook listener running in background');
    }
  } else {
    log.warn('Install Stripe CLI to test webhooks locally:');
    log.info('  brew install stripe/stripe-cli/stripe');
    log.info('  stripe login');
    log.info('  stripe listen --forward-to localhost:3000/api/webhooks/stripe');
  }

  // Step 12: Configure Email Templates
  log.step('Configuring email templates...');

  console.log('\n');
  log.info('Custom email templates are included in supabase/templates/');
  console.log('\n  For production, you need to copy them to Supabase Dashboard:');
  console.log('  Dashboard → Authentication → Email Templates');
  console.log('\n');
  console.log('  ┌─────────────────────────┬──────────────────────────┐');
  console.log('  │ Local File              │ Dashboard Template       │');
  console.log('  ├─────────────────────────┼──────────────────────────┤');
  console.log('  │ confirmation.html       │ Confirm signup           │');
  console.log('  │ magic-link.html         │ Magic Link               │');
  console.log('  │ recovery.html           │ Reset Password           │');
  console.log('  │ email-change.html       │ Change Email Address     │');
  console.log('  └─────────────────────────┴──────────────────────────┘');
  console.log('\n');

  const emailTemplateChoice = await question('  [1] Done  [2] Do later  [3] Open Dashboard: ');

  if (emailTemplateChoice === '3') {
    // Extract project ref from Supabase URL
    const supabaseUrlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (supabaseUrlMatch) {
      const projectRef = supabaseUrlMatch[1];
      const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}/auth/templates`;
      log.info(`Opening: ${dashboardUrl}`);
      try {
        execSync(`open "${dashboardUrl}"`, { stdio: 'ignore' });
      } catch {
        log.info(`Open manually: ${dashboardUrl}`);
      }
    } else {
      log.info('Open: https://supabase.com/dashboard → Your Project → Authentication → Email Templates');
    }
    log.warn('Remember to copy the templates before going to production!');
  } else if (emailTemplateChoice === '1') {
    log.success('Email templates configured!');
  } else {
    log.warn('Remember to configure email templates before going to production!');
    log.info('Templates are in: supabase/templates/');
  }

  // Step 7: Final steps
  log.step('Setup complete!');

  console.log('\n');
  log.success('Your SaaS boilerplate is configured!');
  console.log('\n');

  // Legal Compliance Warning
  log.warn('⚠️  BEFORE PRODUCTION - Legal Compliance:');
  console.log('\n');
  console.log('  📄 Terms of Service:');
  console.log('     ✓ Generated with your company data');
  console.log('     → Review with a lawyer before launch');
  console.log('\n  🔒 Privacy & Cookie Policies:');
  console.log('     ⚠️  Basic templates included (development only)');
  console.log('     → Configure Iubenda for production');
  console.log('     → Cost: €27/year for auto-updating GDPR/CCPA compliance');
  console.log('     → Visit: https://iubenda.com');
  console.log('\n  Setup Iubenda:');
  console.log('     1. Create account at iubenda.com');
  console.log('     2. Generate Privacy + Cookie policies');
  console.log('     3. Add URLs to .env.local:');
  console.log('        NEXT_PUBLIC_IUBENDA_PRIVACY_URL=https://...');
  console.log('        NEXT_PUBLIC_IUBENDA_COOKIE_URL=https://...');
  console.log('     4. Pages will auto-switch to Iubenda content');
  console.log('\n  👥 About Page:');
  console.log('     → Currently uses generic content');
  console.log('     → Customize team section in src/core/shared/config/brand.ts (founders array)');
  console.log('     → Or update About page components directly');
  console.log('\n');

  log.info('Development setup:');
  console.log('  1. Run database migrations:');
  console.log('     npm run setup:db');
  console.log('\n  2. Enable Email auth in Supabase Dashboard (Authentication → Providers)');
  console.log('  3. Create products and a Pricing Table in Stripe Dashboard');
  console.log('  4. Configure Customer Portal in Stripe (Settings → Billing → Customer portal)');
  console.log('  5. Add your og-image.png (1200x630) to /public for social sharing');
  console.log('\n');

  const startDev = await confirm('Start development server now?');
  if (startDev) {
    rl.close();
    log.info('Starting development server...\n');
    execSync('npm run dev', { cwd: rootDir, stdio: 'inherit' });
  } else {
    log.info('Run `npm run dev` to start the development server');
    rl.close();
  }
}

// Run setup based on flags
async function main() {
  try {
    if (hasFlag('--env-only')) {
      await setupEnvOnly();
    } else if (hasFlag('--brand-only')) {
      await setupBrandOnly();
    } else if (hasFlag('--stripe-webhook-only')) {
      await setupStripeWebhookOnly();
    } else if (hasFlag('--sentry-only')) {
      await setupSentryOnly();
    } else {
      await setup();
    }
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    throw error;
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
