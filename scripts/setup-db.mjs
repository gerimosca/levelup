#!/usr/bin/env node

/**
 * Database setup script for SaaS Boilerplate
 * Run with: npm run setup:db
 *
 * This script handles Supabase authentication and migrations.
 * Run this after npm run setup.
 */

import { createInterface } from 'readline';
import { existsSync, readFileSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
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

// Main setup function
async function setupDb() {
  log.title('Database Setup');

  // Check for .env.local
  const envPath = join(rootDir, '.env.local');
  if (!existsSync(envPath)) {
    log.error('.env.local not found. Run npm run setup first.');
    process.exit(1);
  }

  // Read Supabase URL from .env.local
  const envContent = readFileSync(envPath, 'utf-8');
  const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);

  if (!supabaseUrlMatch || !supabaseUrlMatch[1]) {
    log.error('NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
    log.info('Run npm run setup first to configure environment variables.');
    process.exit(1);
  }

  const supabaseUrl = supabaseUrlMatch[1].trim();
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    log.error('Could not extract project ref from Supabase URL');
    log.info(`URL: ${supabaseUrl}`);
    log.info('Expected format: https://[project-ref].supabase.co');
    process.exit(1);
  }

  log.info(`Project ref: ${projectRef}`);

  // Step 1: Link Supabase project
  log.step('Linking Supabase project...');
  log.info('This will open your browser to authenticate with Supabase.\n');

  const proceedLink = await confirm('Continue with Supabase link?');
  if (!proceedLink) {
    log.info('Skipped. Run manually when ready:');
    log.info(`  npx supabase link --project-ref ${projectRef}`);
    rl.close();
    process.exit(0);
  }

  try {
    // Use spawnSync for interactive command
    const linkResult = spawnSync('npx', ['supabase', 'link', '--project-ref', projectRef], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
    });

    if (linkResult.status !== 0) {
      throw new Error('Link command failed');
    }

    log.success('Supabase project linked');
  } catch (error) {
    log.error('Failed to link Supabase project');
    log.info('Try running manually:');
    log.info(`  npx supabase link --project-ref ${projectRef}`);
    rl.close();
    process.exit(1);
  }

  // Step 2: Push migrations
  log.step('Pushing database migrations...');

  const proceedPush = await confirm('Push migrations to Supabase?');
  if (!proceedPush) {
    log.info('Skipped. Run manually when ready:');
    log.info('  npx supabase db push');
    rl.close();
    process.exit(0);
  }

  try {
    execSync('npx supabase db push', { cwd: rootDir, stdio: 'inherit' });
    log.success('Migrations applied successfully');
  } catch (error) {
    log.error('Failed to push migrations');
    log.info('Try running manually:');
    log.info('  npx supabase db push');
    rl.close();
    process.exit(1);
  }

  // Step 3: Generate types
  log.step('Generating TypeScript types...');

  try {
    execSync('npm run gen:types', { cwd: rootDir, stdio: 'inherit' });
    log.success('Types generated successfully');
  } catch (error) {
    log.warn('Failed to generate types. Run manually:');
    log.info('  npm run gen:types');
  }

  // Done
  log.step('Database setup complete!');
  console.log('\n');
  log.success('Your database is ready!');
  console.log('\n');
  log.info('Next steps:');
  console.log('  1. Enable Email auth in Supabase Dashboard (Authentication → Providers)');
  console.log('  2. Run npm run dev to start the development server');
  console.log('\n');

  rl.close();
}

// Run setup
setupDb().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});
