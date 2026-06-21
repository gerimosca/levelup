import { Metadata } from 'next';
import { requireAdmin } from '@/shared/auth';
import { getAffiliateProgramSettings } from '@/features/admin/admin.query';
import { AffiliateSettings } from '@/features/admin/components/affiliate-settings';

export const metadata: Metadata = {
  title: 'Affiliate Program Settings | Admin',
  description: 'Configure affiliate program settings and Rewardful integration',
};

export default async function AdminAffiliatePage() {
  // Require admin authentication
  await requireAdmin();

  // Fetch current affiliate settings
  const settings = await getAffiliateProgramSettings();

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <AffiliateSettings initialSettings={settings} />
    </div>
  );
}