/**
 * Brand Loader
 *
 * Loads brand configuration from src/core/shared/config/brand.ts
 * Provides brand context for AI-generated content.
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createFileError } from './error-handler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

/**
 * Load brand configuration
 *
 * @returns {Object} Brand configuration object
 * @throws {Object} Error if brand.ts cannot be loaded
 *
 * @example
 * const brand = loadBrandConfig();
 * console.log(brand.name); // "MySaaS"
 */
export function loadBrandConfig() {
  const brandPath = path.join(projectRoot, 'src/core/shared/config/brand.ts');

  try {
    // Read the TypeScript file as text
    const content = readFileSync(brandPath, 'utf-8');

    // Extract brandConfig object using regex
    // This is a simple parser - works for standard export const brandConfig = {...}
    const brandMatch = content.match(/export\s+const\s+brandConfig\s*=\s*({[\s\S]*?})\s*;/);

    if (!brandMatch) {
      throw new Error('Could not find brandConfig export in brand.ts');
    }

    // Parse the JavaScript object
    // Remove comments and TypeScript type annotations
    let brandStr = brandMatch[1]
      .replace(/\/\/.*/g, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/:\s*[A-Z][a-zA-Z0-9<>[\]|]*(?=\s*[,}])/g, ''); // Remove type annotations

    // Wrap keys in quotes to make it valid JSON
    brandStr = brandStr.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

    // Use Function constructor to evaluate (safer than eval)
    const brandConfig = new Function(`return ${brandStr}`)();

    return {
      name: brandConfig.name || 'MySaaS',
      tagline: brandConfig.tagline || '',
      description: brandConfig.description || '',
      voice: brandConfig.voice || 'professional and clear',
      url: brandConfig.url || '',
      ...brandConfig
    };

  } catch (error) {
    throw createFileError(
      'load',
      brandPath,
      `Make sure brand.ts exists and has valid brandConfig export.\n\n${error.message}`,
      2
    );
  }
}

/**
 * Get brand context as formatted string for AI prompts
 *
 * @returns {string} Formatted brand context
 */
export function getBrandContext() {
  const brand = loadBrandConfig();

  return `Brand Context:
- Name: ${brand.name}
- Tagline: ${brand.tagline || 'N/A'}
- Voice: ${brand.voice || 'professional and clear'}
- Description: ${brand.description || 'N/A'}`;
}
