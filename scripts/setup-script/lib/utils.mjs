/**
 * Utility functions for setup script
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.join(__dirname, '../../..');

// ANSI color codes
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Backgrounds
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

/**
 * Clear console
 */
export function clearConsole() {
  process.stdout.write('\x1Bc');
}

/**
 * Print colored text
 */
export function print(text, color = '') {
  console.log(`${color}${text}${colors.reset}`);
}

/**
 * Print line separator
 */
export function printSeparator(char = '─', length = 60) {
  print(char.repeat(length), colors.gray);
}

/**
 * Print box
 */
export function printBox(lines, width = 60) {
  const top = `┌${'─'.repeat(width - 2)}┐`;
  const bottom = `└${'─'.repeat(width - 2)}┘`;

  console.log(colors.cyan + top + colors.reset);

  lines.forEach((line) => {
    const padding = width - 4 - stripAnsi(line).length;
    const paddedLine = line + ' '.repeat(Math.max(0, padding));
    console.log(`${colors.cyan}│${colors.reset} ${paddedLine} ${colors.cyan}│${colors.reset}`);
  });

  console.log(colors.cyan + bottom + colors.reset);
}

/**
 * Strip ANSI codes for length calculation
 */
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Get status icon
 */
export function getStatusIcon(status) {
  const icons = {
    completed: '✅',
    pending: '⏸️',
    partial: '⚠️',
    failed: '❌',
    skipped: '⏭️',
    'not-started': '⚪',
  };
  return icons[status] || '⚪';
}

/**
 * Get status color
 */
export function getStatusColor(status) {
  const statusColors = {
    completed: colors.green,
    pending: colors.gray,
    partial: colors.yellow,
    failed: colors.red,
    skipped: colors.blue,
    'not-started': colors.gray,
  };
  return statusColors[status] || colors.gray;
}

/**
 * Get priority icon
 */
export function getPriorityIcon(priority) {
  const icons = {
    critical: '🔴',
    'critical-for-production': '🟠',
    recommended: '🟡',
    optional: '⚪',
    mixed: '🔵',
  };
  return icons[priority] || '⚪';
}

/**
 * Format progress bar
 */
export function formatProgressBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  let color = colors.red;
  if (percentage >= 75) color = colors.green;
  else if (percentage >= 50) color = colors.yellow;

  return `${color}${'█'.repeat(filled)}${colors.gray}${'░'.repeat(empty)}${colors.reset} ${percentage}%`;
}

/**
 * Run command silently
 */
export function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: PROJECT_ROOT,
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

/**
 * Check if command exists
 */
export function hasCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check Node.js version
 */
export function checkNodeVersion() {
  const version = process.version.replace('v', '');
  const major = parseInt(version.split('.')[0], 10);
  return major;
}

/**
 * Check if file exists
 */
export function fileExists(filepath) {
  return fs.existsSync(path.join(PROJECT_ROOT, filepath));
}

/**
 * Read env file
 */
export function readEnvFile() {
  const envPath = path.join(PROJECT_ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return {};

  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

/**
 * Check if env variable is set
 */
export function hasEnvVar(key) {
  const env = readEnvFile();
  return !!env[key] && env[key].length > 0;
}

/**
 * Prompt user for input
 */
export function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const displayDefault = defaultValue ? ` ${colors.gray}[${defaultValue}]${colors.reset}` : '';
    rl.question(`${question}${displayDefault}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Confirm action
 */
export async function confirm(question, defaultValue = true) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await prompt(`${question} (${defaultText})`);

  if (!answer) return defaultValue;
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Sleep for ms
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Open URL in browser
 */
export function openUrl(url) {
  const platform = process.platform;
  const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';

  try {
    execSync(`${command} "${url}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Format timestamp
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Truncate text
 */
export function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Pad text to width
 */
export function pad(text, width, align = 'left') {
  const stripped = stripAnsi(text);
  const padding = width - stripped.length;

  if (padding <= 0) return text;

  if (align === 'right') {
    return ' '.repeat(padding) + text;
  } else if (align === 'center') {
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  }

  return text + ' '.repeat(padding);
}
