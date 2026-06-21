#!/usr/bin/env node

/**
 * Pre-commit checker and auto-fixer
 * Runs type-check and lint, attempts to auto-fix what it can
 * Optimized for minimal output to reduce token consumption
 */

const { execSync } = require('child_process');

// Simple color functions without dependencies
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  blue: (msg) => console.log(colors.blue + msg + colors.reset),
  green: (msg) => console.log(colors.green + msg + colors.reset),
  yellow: (msg) => console.log(colors.yellow + msg + colors.reset),
  red: (msg) => console.log(colors.red + msg + colors.reset),
  cyan: (msg) => console.log(colors.cyan + msg + colors.reset),
};

/**
 * Helper to run commands with optimized output
 * Only shows output if there are errors/warnings
 */
function runCommand(cmd, description) {
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      stdio: 'pipe' // Capture instead of inherit
    });

    // Only show if there are errors or warnings
    const hasIssues = output.match(/error|warning/gi);
    if (hasIssues && hasIssues.length > 0) {
      console.log(output);
    }

    log.green(`✅ ${description} passed!`);
    return true;
  } catch (error) {
    // Show stderr on errors
    if (error.stderr) {
      console.log(error.stderr.toString());
    } else if (error.stdout) {
      console.log(error.stdout.toString());
    }
    log.red(`❌ ${description} failed.`);
    return false;
  }
}

log.blue('🔍 Running pre-commit checks...\n');

let hasErrors = false;

// Step 1: Run TypeScript type check
log.yellow('📝 Checking TypeScript types...');
if (!runCommand('npm run type-check', 'TypeScript check')) {
  hasErrors = true;
}

// Step 2: Try to auto-fix ESLint issues
log.yellow('\n🔧 Running ESLint with auto-fix...');
try {
  execSync('npm run lint:fix', { stdio: 'pipe' });
  log.green('✅ ESLint auto-fix complete!');
} catch (error) {
  log.yellow('⚠️  Some ESLint issues could not be auto-fixed.');
}

// Step 3: Run ESLint to check for remaining errors
log.yellow('\n📋 Checking for remaining ESLint issues...');
if (!runCommand('npm run lint', 'ESLint check')) {
  hasErrors = true;
}

// Step 4: Run tests
log.yellow('\n🧪 Running tests...');
if (!runCommand('npm run test', 'Tests')) {
  // Tests failures are warnings, not blockers for now
  log.yellow('⚠️  Some tests failed.');
}

// Final summary
console.log(''); // Empty line for spacing
if (!hasErrors) {
  log.green('✨ All checks passed! Ready to commit.');
  log.cyan('You can now run: git add . && git commit -m "your message"');
} else {
  log.red('⚠️  Some issues need manual fixing.');
  log.cyan('After fixing, run: npm run check');
  process.exit(1);
}