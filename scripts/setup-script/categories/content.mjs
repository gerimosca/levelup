/**
 * Content & SEO Category
 */

import { runCommand, openUrl } from '../lib/utils.mjs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export default {
  id: 'content',
  name: 'Content & SEO',
  description: 'Landing pages and copy',
  priority: 'recommended',
  steps: [
    {
      id: 'landing-copy',
      name: 'Adapt landing pages copy',
      description: 'AI-powered copy generation for Home, About, Pricing',
      type: 'automated',
      aiAssisted: true,
      required: false,
      verification: 'landing-copy',
      action: async () => {
        // Check if brand-config has been completed
        const brandPath = join(process.cwd(), 'src/core/shared/config/brand.ts');

        if (!existsSync(brandPath)) {
          return {
            success: false,
            message: '⚠️  Brand configuration not found. Please complete the "Brand configuration" step first (in Branding & Design category).',
          };
        }

        // Check if brand has been customized (not using default values)
        const brandContent = readFileSync(brandPath, 'utf-8');
        if (brandContent.includes("name: 'AI SaaS'")) {
          return {
            success: false,
            message: '⚠️  Brand not customized yet. Please complete the "Brand configuration" step first (in Branding & Design category).',
          };
        }

        const result = runCommand('node scripts/setup-copy.mjs');
        return {
          success: result.success,
          message: result.success
            ? 'Landing pages copy adapted'
            : 'Failed to adapt landing copy',
        };
      },
    },
    {
      id: 'seo-pages',
      name: 'SEO landing pages',
      description: 'Generate use case and alternative pages',
      type: 'automated',
      aiAssisted: true,
      required: false,
      verification: 'seo-pages',
      action: async () => {
        const result = runCommand('npm run setup:seo');
        return {
          success: result.success,
          message: result.success ? 'SEO pages generated' : 'Failed to generate SEO pages',
        };
      },
    },
    {
      id: 'translations',
      name: 'Review translations',
      description: 'Review and customize en/es translations',
      type: 'manual',
      required: false,
      instructions: [
        'Open /messages folder in your editor',
        'Review generated translations (en.json, es.json)',
        'Customize to match your brand voice',
        'Test both languages in the app (http://localhost:3000?locale=en)',
      ],
      links: [
        {
          label: 'Open translations folder',
          action: () => {
            // This will be handled by the menu system
            return { type: 'open-folder', path: 'messages' };
          },
        },
      ],
    },
  ],
};
