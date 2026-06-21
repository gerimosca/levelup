/**
 * Third-party Integrations Category
 */

import { runCommand, openUrl } from '../lib/utils.mjs';

export default {
  id: 'integrations',
  name: 'Third-party Integrations',
  description: 'Stripe, email, monitoring',
  priority: 'mixed',
  steps: [
    {
      id: 'stripe-products',
      name: 'Create Stripe products',
      description: 'Set up product tiers in Stripe Dashboard',
      type: 'manual',
      required: true,
      priority: 'critical',
      instructions: [
        '1. Open Stripe Dashboard → Products',
        '2. Create your product tiers:',
        '   • Free tier (€0/month or feature-limited)',
        '   • Pro tier (e.g., €29/month)',
        '   • Enterprise (custom pricing)',
        '3. Note the Price IDs for each tier',
        '4. Test with test mode first',
      ],
      links: [
        {
          label: 'Open Stripe Products Dashboard',
          url: 'https://dashboard.stripe.com/products',
        },
        {
          label: 'View Stripe setup guide',
          url: 'https://stripe.com/docs/products-prices/overview',
        },
      ],
    },
    {
      id: 'stripe-pricing-table',
      name: 'Create Stripe Pricing Table',
      description: 'Generate pricing table embed code',
      type: 'manual',
      required: true,
      priority: 'critical',
      instructions: [
        '1. Open Stripe Dashboard → Pricing tables',
        '2. Click "Create pricing table"',
        '3. Add your products from previous step',
        '4. Customize appearance and features',
        '5. Copy the Pricing Table ID',
        '6. Add to .env.local: NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_xxx',
      ],
      links: [
        {
          label: 'Open Stripe Pricing Tables',
          url: 'https://dashboard.stripe.com/pricing-tables',
        },
        {
          label: 'Pricing tables docs',
          url: 'https://stripe.com/docs/payments/checkout/pricing-table',
        },
      ],
    },
    {
      id: 'stripe-webhooks',
      name: 'Configure Stripe webhooks',
      description: 'Set up webhook for local testing',
      type: 'automated',
      required: false,
      priority: 'recommended',
      verification: 'stripe-webhooks',
      action: async () => {
        const result = runCommand('node scripts/setup.mjs --stripe-webhook-only');
        return {
          success: result.success,
          message: result.success ? 'Stripe webhook configured' : 'Failed to configure webhook',
        };
      },
    },
    {
      id: 'email-provider',
      name: 'Configure email provider (Resend)',
      description: 'Set up transactional emails',
      type: 'automated',
      required: false,
      priority: 'recommended',
      verification: 'email-provider',
      action: async () => {
        const result = runCommand('node scripts/generators/email.mjs');
        return {
          success: result.success,
          message: result.success ? 'Email provider configured' : 'Failed to configure email',
        };
      },
    },
    {
      id: 'email-templates',
      name: 'Copy email templates to Supabase',
      description: 'Customize auth email templates',
      type: 'manual',
      required: false,
      priority: 'recommended',
      instructions: [
        '1. Open Supabase Dashboard → Authentication → Email Templates',
        '2. For each template (Confirm signup, Magic Link, etc.):',
        '   • Copy from /supabase/email-templates/',
        '   • Paste into Supabase Dashboard',
        '   • Customize with your brand',
        '3. Test by triggering a verification email',
      ],
      links: [
        {
          label: 'Open Supabase Auth Settings',
          action: () => {
            // Will open Supabase project dashboard
            return { type: 'open-supabase', path: 'auth/templates' };
          },
        },
      ],
    },
    {
      id: 'sentry',
      name: 'Error monitoring (Sentry)',
      description: 'Set up error tracking (optional)',
      type: 'automated',
      required: false,
      priority: 'optional',
      verification: 'sentry',
      action: async () => {
        const result = runCommand('node scripts/setup.mjs --sentry-only');
        return {
          success: result.success,
          message: result.success ? 'Sentry configured' : 'Failed to configure Sentry',
        };
      },
    },
  ],
};
