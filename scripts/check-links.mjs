#!/usr/bin/env node

/**
 * Check for broken links in the application
 * Run with: npm run check:links
 *
 * Builds the app, starts a server, runs linkinator, and exits.
 */

import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load .env.local if it exists (needed for Supabase and other services)
const envLocalPath = join(rootDir, '.env.local');
if (existsSync(envLocalPath)) {
  const envContent = readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
      process.env[key] = value;
    }
  }
} else {
  console.log('\x1b[33m⚠\x1b[0m No .env.local found - skipping link check (Supabase credentials required)');
  console.log('  To enable: copy .env.example to .env.local and add your Supabase credentials');
  process.exit(0); // Exit gracefully, don't fail the hook
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
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
};

/**
 * Wait for server to be ready by polling the health endpoint
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} delayMs - Delay between attempts in ms
 * @returns {Promise<boolean>} - True if server is ready
 */
async function waitForServer(maxAttempts = 30, delayMs = 500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Log progress every 10 attempts
    if (attempt % 10 === 0) {
      log.info(`Still waiting for server... (attempt ${attempt}/${maxAttempts})`);
    }
    try {
      const isReady = await new Promise((resolve) => {
        const req = http.get('http://localhost:3000/', (res) => {
          // Accept 200, 302 (temporary redirect), 307, or 308 as "ready"
          resolve(res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
          req.destroy();
          resolve(false);
        });
      });

      if (isReady) {
        return true;
      }
    } catch {
      // Ignore errors, will retry
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

async function checkLinks() {
  let serverProcess = null;

  try {
    // Build the app (pass env vars to subprocess)
    log.info('Building application...');
    try {
      execSync('npm run build', { cwd: rootDir, stdio: 'pipe', env: process.env });
      log.success('Build complete');
    } catch (error) {
      // Show only stderr if build fails
      if (error.stderr) {
        console.log(error.stderr.toString());
      }
      throw new Error('Build failed');
    }

    // Kill any existing process on port 3000
    try {
      execSync('lsof -ti :3000 | xargs kill -9 2>/dev/null || true', { stdio: 'pipe' });
    } catch {
      // Ignore errors - port might already be free
    }

    // Start the server (pass env vars to subprocess)
    log.info('Starting server...');
    serverProcess = spawn('npm', ['run', 'start'], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'inherit'], // inherit stderr to see errors in real-time
      shell: true,
      env: process.env,
    });

    // Log server startup messages
    serverProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      // Log when server shows ready or important messages
      if (msg.includes('Ready in') || msg.includes('✓') || msg.includes('Local:')) {
        log.info(`Server: ${msg.trim()}`);
      }
    });

    // Handle process errors
    serverProcess.on('error', (err) => {
      log.error(`Failed to start server: ${err.message}`);
    });

    serverProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        log.error(`Server exited unexpectedly with code ${code}`);
      }
    });

    // Wait for server to be ready by polling
    log.info('Waiting for server to be ready...');
    const serverReady = await waitForServer(60, 500); // 60 attempts, 500ms each = 30s max

    if (!serverReady) {
      throw new Error('Server did not become ready in time');
    }

    log.success('Server ready');

    // Run linkinator
    log.info('Checking for broken links...');

    const linkinatorArgs = [
      'http://localhost:3000',
      '--recurse',
      '--skip', '"^(?!http://localhost:3000).*$"', // Only check internal links
      '--skip', '"/assessment"', // Skip assessment links (data from external DB)
      '--timeout', '10000',
    ];

    try {
      const output = execSync(`npx linkinator ${linkinatorArgs.join(' ')}`, {
        cwd: rootDir,
        stdio: 'pipe',
        encoding: 'utf8',
      });

      // Show full output
      console.log(output);

      // Filter and show only broken links
      const lines = output.split('\n');
      const brokenLines = lines.filter(line =>
        line.includes('✖') || line.includes('BROKEN') || line.includes('ERROR')
      );

      if (brokenLines.length > 0) {
        log.error('Broken links detected!');
        process.exitCode = 1;
      } else {
        log.success('No broken links found!');
      }
    } catch (error) {
      // Show full output if linkinator fails (exit code != 0)
      if (error.stdout) {
        console.log(error.stdout.toString());
      }
      if (error.stderr) {
        console.log('STDERR:', error.stderr.toString());
      }
      log.error('Broken links detected!');
      process.exitCode = 1;
    }

  } catch (error) {
    log.error(`Check failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // Cleanup: kill the server
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      log.info('Server stopped');
    }
  }
}

checkLinks();
