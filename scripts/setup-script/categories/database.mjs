/**
 * Database Setup Category
 */

import { runCommand } from '../lib/utils.mjs';

export default {
  id: 'database',
  name: 'Database Setup',
  description: 'Supabase schema and types',
  priority: 'critical',
  steps: [
    {
      id: 'link-supabase',
      name: 'Link Supabase project',
      description: 'Connect to your Supabase project',
      type: 'manual-pause',
      required: true,
      verification: 'link-supabase',
      instructions: [
        'Run this command in your terminal:',
        '',
        '  supabase link',
        '',
        'Follow the prompts to connect to your Supabase project.',
        'Once completed, resume setup with:',
        '',
        '  npm run setup:resume',
      ],
      pauseReason: 'Supabase link requires interactive terminal input',
    },
    {
      id: 'run-migrations',
      name: 'Apply database migrations',
      description: 'Push database schema to Supabase',
      type: 'automated',
      required: true,
      verification: 'run-migrations',
      action: async () => {
        const result = runCommand('npx supabase db push');
        return {
          success: result.success,
          message: result.success ? 'Migrations applied' : 'Failed to apply migrations',
        };
      },
    },
    {
      id: 'generate-types',
      name: 'Generate TypeScript types',
      description: 'Generate types from database schema',
      type: 'automated',
      required: true,
      verification: 'generate-types',
      action: async () => {
        const result = runCommand('npm run gen:types');
        return {
          success: result.success,
          message: result.success ? 'Types generated' : 'Failed to generate types',
        };
      },
    },
  ],
};
