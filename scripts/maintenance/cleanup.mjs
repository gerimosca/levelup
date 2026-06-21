#!/usr/bin/env node

/**
 * Cleanup Script - Periodic maintenance for temporary files
 *
 * This script:
 * - Removes log files older than 7 days
 * - Lists manual backups for review
 * - Lists planning files that might be completed
 *
 * Usage:
 *   npm run cleanup
 *   node scripts/maintenance/cleanup.mjs
 */

import { readdir, stat, unlink } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// ANSI colors for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`)
};

/**
 * Recursively find files matching a pattern
 */
async function findFiles(dir, pattern, excludeDirs = ['node_modules', '.git', '.next']) {
  const results = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          results.push(...await findFiles(fullPath, pattern, excludeDirs));
        }
      } else if (entry.isFile()) {
        if (pattern.test(entry.name)) {
          results.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Silently skip directories we can't read
  }

  return results;
}

/**
 * Check if file is older than N days
 */
async function isOlderThan(filePath, days) {
  try {
    const stats = await stat(filePath);
    const now = Date.now();
    const fileAge = now - stats.mtimeMs;
    const maxAge = days * 24 * 60 * 60 * 1000; // days to milliseconds

    return fileAge > maxAge;
  } catch {
    return false;
  }
}

/**
 * Remove old log files
 */
async function removeOldLogs() {
  log.info('\n📝 Checking for old log files...');

  const logFiles = await findFiles(rootDir, /\.log$/);
  const oldLogs = [];

  for (const logFile of logFiles) {
    if (await isOlderThan(logFile, 7)) {
      oldLogs.push(logFile);
    }
  }

  if (oldLogs.length === 0) {
    log.success('   No old log files found');
    return;
  }

  log.warning(`   Found ${oldLogs.length} old log file(s):`);

  for (const logFile of oldLogs) {
    const relativePath = relative(rootDir, logFile);
    try {
      await unlink(logFile);
      log.success(`   ✓ Removed: ${relativePath}`);
    } catch (error) {
      log.error(`   ✗ Failed to remove: ${relativePath}`);
    }
  }
}

/**
 * List backup files for manual review
 */
async function listBackups() {
  log.info('\n📦 Checking for backup files...');

  const patterns = [
    /\.backup$/,
    /\.backup\./,
    /\.old$/,
    /backup.*\//
  ];

  const backupFiles = [];

  for (const pattern of patterns) {
    const files = await findFiles(rootDir, pattern);
    backupFiles.push(...files);
  }

  // Also find backup directories
  const allEntries = await readdir(rootDir, { withFileTypes: true });
  for (const entry of allEntries) {
    if (entry.isDirectory() && /backup/i.test(entry.name)) {
      backupFiles.push(join(rootDir, entry.name));
    }
  }

  if (backupFiles.length === 0) {
    log.success('   No backup files found');
    return;
  }

  log.warning(`   Found ${backupFiles.length} backup file(s)/folder(s):`);
  for (const file of backupFiles) {
    const relativePath = relative(rootDir, file);
    console.log(`   - ${relativePath}`);
  }

  log.info('\n   💡 To remove backups:');
  log.info('      git clean -fdx (CAREFUL! This removes ALL untracked files)');
  log.info('      Or delete them manually');
}

/**
 * List planning files
 */
async function listPlanningFiles() {
  log.info('\n📋 Checking for planning files...');

  const patterns = [
    /\.plan\.md$/,
    /\.wip\.md$/
  ];

  const planningFiles = [];

  for (const pattern of patterns) {
    const files = await findFiles(rootDir, pattern);
    planningFiles.push(...files);
  }

  if (planningFiles.length === 0) {
    log.success('   No planning files found');
    return;
  }

  log.warning(`   Found ${planningFiles.length} planning file(s):`);
  for (const file of planningFiles) {
    const relativePath = relative(rootDir, file);
    console.log(`   - ${relativePath}`);
  }

  log.info('\n   💡 If these are completed:');
  log.info('      Move to docs/archive/ or delete them');
}

/**
 * Main cleanup function
 */
async function main() {
  console.log('');
  log.info('🧹 Starting cleanup...');

  try {
    await removeOldLogs();
    await listBackups();
    await listPlanningFiles();

    console.log('');
    log.success('✅ Cleanup complete!');
    console.log('');
  } catch (error) {
    console.log('');
    log.error('❌ Cleanup failed:');
    log.error(`   ${error.message}`);
    process.exit(1);
  }
}

main();
