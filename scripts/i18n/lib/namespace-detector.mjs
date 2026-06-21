/**
 * Namespace Detector
 *
 * Detects the i18n namespace from a file path using the existing
 * namespace-mapping rules.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

/**
 * Namespace mapping patterns (synced with src/i18n/namespace-mapping.ts)
 */
const namespaceMappings = [
  // App Router Nested Routes
  {
    pattern: /src\/app\/\[locale\]\/\([^\/]+\)\/(.+)\/copies\//,
    extractor: (match) => match[1].replace(/\//g, '-'),
  },

  // App Router Root of Group
  {
    pattern: /src\/app\/\[locale\]\/\(([^)]+)\)\/copies\//,
    extractor: (match) => match[1],
  },

  // App Router Catch-all
  {
    pattern: /src\/app\/\[locale\]\/\[\.\.\.rest\]\/copies\//,
    extractor: () => 'errors',
  },

  // App Router Shared
  {
    pattern: /src\/app\/\[locale\]\/_shared\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },

  // Features
  {
    pattern: /src\/core\/features\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },

  // My-SaaS Features
  {
    pattern: /src\/my-saas\/features\/([^\/]+)\/copies\//,
    extractor: (match) => match[1],
  },

  // Shared UI
  {
    pattern: /src\/core\/shared\/components\/ui\/copies\//,
    extractor: () => 'ui',
  },

  // Shared Layouts
  {
    pattern: /src\/core\/shared\/components\/layouts\/copies\//,
    extractor: () => 'layouts',
  },

  // Shared SEO
  {
    pattern: /src\/core\/shared\/components\/seo\/copies\//,
    extractor: () => 'seo',
  },

  // Shared Legal
  {
    pattern: /src\/core\/shared\/legal\/copies\//,
    extractor: () => 'legal',
  },

  // Shared Errors
  {
    pattern: /src\/core\/shared\/errors\/copies\//,
    extractor: () => 'errors',
  },
];

/**
 * Detect namespace from a path
 *
 * @param {string} targetPath - Absolute or relative path
 * @returns {string|null} Detected namespace or null
 *
 * @example
 * detectNamespace('app/[locale]/(landing)/pricing')
 * // Returns: 'pricing'
 */
export function detectNamespace(targetPath) {
  // Normalize path - make it absolute if relative
  let absolutePath = targetPath;
  if (!path.isAbsolute(targetPath)) {
    absolutePath = path.join(projectRoot, targetPath);
  }

  // If path doesn't end with /copies, add it for pattern matching
  if (!absolutePath.endsWith('/copies') && !absolutePath.includes('/copies/')) {
    absolutePath = path.join(absolutePath, 'copies');
  }

  // Normalize separators
  const normalized = absolutePath.replace(/\\/g, '/');

  // Ensure pattern has /copies/ for matching
  const pathWithCopies = normalized.includes('/copies/') ? normalized : `${normalized}/`;

  // Try each pattern
  for (const mapping of namespaceMappings) {
    const match = pathWithCopies.match(mapping.pattern);
    if (match) {
      return mapping.extractor(match);
    }
  }

  // If no match, try to extract from last directory before /copies
  const copiesMatch = normalized.match(/\/([^\/]+)\/copies\/?$/);
  if (copiesMatch) {
    return copiesMatch[1];
  }

  return null;
}

/**
 * Validate that a namespace was detected
 *
 * @param {string} filePath - File path
 * @param {string|null} namespace - Detected namespace
 * @throws {Object} Error if namespace is null
 */
export function validateNamespace(filePath, namespace) {
  if (!namespace) {
    throw {
      code: 1,
      message: `Failed to detect namespace from path: ${filePath}\n\nThis path doesn't match any known pattern.\nCheck scripts/i18n/lib/namespace-detector.mjs for valid patterns.`
    };
  }
}
