/**
 * Legal & Compliance Category
 */

import { runCommand } from '../lib/utils.mjs';

export default {
  id: 'compliance',
  name: 'Legal & Compliance',
  description: 'Privacy, terms, GDPR',
  priority: 'critical-for-production',
  steps: [
    {
      id: 'legal-pages',
      name: 'Customize legal pages',
      description: 'Update Privacy Policy and Terms of Service',
      type: 'automated',
      required: true,
      priority: 'critical-for-production',
      verification: 'legal-pages',
      action: async () => {
        const result = runCommand('node scripts/generators/legal.mjs');
        return {
          success: result.success,
          message: result.success ? 'Legal pages customized' : 'Failed to customize legal pages',
        };
      },
    },
    {
      id: 'gdpr-setup',
      name: 'GDPR compliance (Iubenda)',
      description: 'Set up cookie consent and privacy compliance',
      type: 'manual',
      required: false,
      priority: 'critical-for-production',
      instructions: [
        '1. Sign up for Iubenda (~€27/year)',
        '   → https://www.iubenda.com',
        '2. Create Privacy Policy using their generator',
        '3. Create Cookie Policy',
        '4. Generate embed code',
        '5. Copy Privacy Policy URL',
        '6. Add to .env.local:',
        '   NEXT_PUBLIC_IUBENDA_PRIVACY_URL=https://your-policy-url',
        '7. Test cookie banner on your site',
      ],
      links: [
        {
          label: 'Sign up for Iubenda',
          url: 'https://www.iubenda.com',
        },
        {
          label: 'GDPR Compliance Guide',
          url: 'https://gdpr.eu/checklist/',
        },
      ],
    },
  ],
};
