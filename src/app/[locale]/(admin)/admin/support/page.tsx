import { Metadata } from 'next';
import { requireAdmin } from '@/shared/auth';
import { getCrispSettings } from '@/features/crisp/crisp.query';
import { CrispSettingsForm } from '@/features/crisp/components/crisp-settings';

export const metadata: Metadata = {
  title: 'Customer Support Settings | Admin',
  description: 'Configure customer support chat settings',
};

export default async function AdminSupportPage() {
  await requireAdmin();

  const crispSettings = await getCrispSettings();

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Customer Support</h1>
        <p className="text-muted-foreground mt-2">
          Configure Crisp chat for customer support
        </p>
      </div>

      <CrispSettingsForm initialSettings={crispSettings} />
    </div>
  );
}