/**
 * Infrastructure Setup Category
 */

import { runCommand } from '../lib/utils.mjs';

export default {
  id: 'infrastructure',
  name: 'Infrastructure Setup',
  description: 'Core dependencies and environment',
  priority: 'critical',
  steps: [
    {
      id: 'check-node',
      name: 'Check Node.js version',
      description: 'Verify Node.js v20+ is installed',
      type: 'automated',
      required: true,
      verification: 'check-node',
      action: async () => {
        return {
          success: false,
          message: 'Please upgrade Node.js to v20 or higher: https://nodejs.org',
        };
      },
    },
    {
      id: 'check-supabase-cli',
      name: 'Check Supabase CLI',
      description: 'Verify Supabase CLI is installed',
      type: 'automated',
      required: true,
      verification: 'check-supabase-cli',
      action: async () => {
        const result = runCommand('npm install -g supabase');
        return {
          success: result.success,
          message: result.success
            ? 'Supabase CLI installed successfully'
            : 'Failed to install Supabase CLI',
        };
      },
    },
    {
      id: 'check-stripe-cli',
      name: 'Check Stripe CLI',
      description: 'Verify Stripe CLI is installed (optional but recommended)',
      type: 'automated',
      required: false,
      verification: 'check-stripe-cli',
      action: async () => {
        return {
          success: false,
          message:
            'Please install Stripe CLI manually: https://stripe.com/docs/stripe-cli#install',
        };
      },
    },
    {
      id: 'install-deps',
      name: 'Install dependencies',
      description: 'Run npm install to install project dependencies',
      type: 'automated',
      required: true,
      verification: 'install-deps',
      action: async () => {
        const result = runCommand('npm install');
        return {
          success: result.success,
          message: result.success ? 'Dependencies installed' : 'Failed to install dependencies',
        };
      },
    },
    {
      id: 'setup-env',
      name: 'Configure environment variables',
      description: 'Set up .env.local with Supabase and Stripe credentials',
      type: 'automated',
      required: true,
      verification: 'setup-env',
      action: async () => {
        // Delegate to legacy setup script
        const result = runCommand('node scripts/setup.mjs --env-only');
        return {
          success: result.success,
          message: result.success ? 'Environment configured' : 'Failed to configure environment',
        };
      },
    },
  ],
};
