/**
 * Copy Detector
 * Auto-detects landing page structure from messages files
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

/**
 * Flatten nested object to dot notation
 */
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      acc[pre + key] = obj[key];
    }
    return acc;
  }, {});
}

/**
 * Detect structure of landing pages from messages file
 */
export function detectLandingStructure(lang = 'en') {
  const messagesPath = join(PROJECT_ROOT, `messages/${lang}.json`);
  const messages = JSON.parse(readFileSync(messagesPath, 'utf-8'));

  const structure = {
    landing: extractNamespace(messages.landing, 'landing'),
    about: extractNamespace(messages.about, 'about'),
    pricing: extractNamespace(messages.pricing, 'pricing'),
  };

  return structure;
}

/**
 * Extract namespace structure
 */
function extractNamespace(namespace, name) {
  if (!namespace) {
    return {
      name,
      keys: [],
      total: 0,
      sections: [],
      exists: false,
    };
  }

  const flattened = flattenObject(namespace);
  const keys = Object.keys(flattened);
  const sections = [...new Set(keys.map((k) => k.split('.')[0]))];

  return {
    name,
    keys: keys.map((k) => `${name}.${k}`),
    total: keys.length,
    sections,
    exists: true,
  };
}

/**
 * Check if copy is generic (contains default boilerplate terms)
 */
export function hasGenericCopy(lang = 'en') {
  const messagesPath = join(PROJECT_ROOT, `messages/${lang}.json`);
  const messages = JSON.parse(readFileSync(messagesPath, 'utf-8'));

  const genericTerms = [
    'AI SaaS',
    'Build faster with AI',
    'Build Your SaaS Faster',
    'example.com',
    'Production-ready boilerplate',
  ];

  const flattened = flattenObject(messages);
  const hasGeneric = Object.entries(flattened).some(([key, value]) => {
    if (typeof value !== 'string') return false;
    return genericTerms.some((term) => value.includes(term));
  });

  return hasGeneric;
}

/**
 * Compare structures to detect new keys
 */
export function detectNewKeys(currentMessages, previousMessages) {
  const currentKeys = Object.keys(flattenObject(currentMessages));
  const previousKeys = Object.keys(flattenObject(previousMessages));

  return currentKeys.filter((k) => !previousKeys.includes(k));
}

/**
 * Get translation parity (missing translations)
 */
export function getTranslationParity() {
  const enPath = join(PROJECT_ROOT, 'messages/en.json');
  const esPath = join(PROJECT_ROOT, 'messages/es.json');

  const enMessages = JSON.parse(readFileSync(enPath, 'utf-8'));
  const esMessages = JSON.parse(readFileSync(esPath, 'utf-8'));

  const enKeys = Object.keys(flattenObject(enMessages));
  const esKeys = Object.keys(flattenObject(esMessages));

  const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
  const missingInEn = esKeys.filter((k) => !enKeys.includes(k));

  return {
    complete: missingInEs.length === 0 && missingInEn.length === 0,
    missingInEs,
    missingInEn,
  };
}
