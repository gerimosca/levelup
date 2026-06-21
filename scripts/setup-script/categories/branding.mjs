/**
 * Branding & Design Category
 */

import { runCommand } from '../lib/utils.mjs';

export default {
  id: 'branding',
  name: 'Branding & Design',
  description: 'Visual identity and brand voice',
  priority: 'recommended',
  steps: [
    {
      id: 'brand-config',
      name: 'Brand configuration',
      description: 'Set company name, tagline, and SEO metadata',
      type: 'automated',
      aiAssisted: true,
      required: false,
      verification: 'brand-config',
      action: async () => {
        const result = runCommand('node scripts/setup.mjs --brand-only');
        return {
          success: result.success,
          message: result.success ? 'Brand configured' : 'Failed to configure brand',
        };
      },
    },
    {
      id: 'color-palette',
      name: 'Color palette',
      description: 'Customize primary and secondary colors',
      type: 'automated',
      aiAssisted: true,
      required: false,
      verification: 'color-palette',
      action: async () => {
        const result = runCommand('node scripts/generators/colors.mjs');
        return {
          success: result.success,
          message: result.success ? 'Colors configured' : 'Failed to configure colors',
        };
      },
    },
    {
      id: 'assets',
      name: 'Logo, favicon, OG images',
      description: 'Upload or generate brand assets',
      type: 'automated',
      required: false,
      verification: 'assets',
      action: async () => {
        const result = runCommand('node scripts/generators/assets.mjs');
        return {
          success: result.success,
          message: result.success ? 'Assets configured' : 'Failed to configure assets',
        };
      },
    },
  ],
};
