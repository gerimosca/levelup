import { getTranslations } from 'next-intl/server';
import { InfoBarSettings } from '@/features/admin/components/info-bar-settings';
import { getInfoBarSettings } from '@/features/admin/admin.query';

interface AdminSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminSettingsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.settings.page' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AdminSettingsPage({
  params,
}: AdminSettingsPageProps) {
  const { locale } = await params;
  const infoBarSettings = await getInfoBarSettings();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure global application settings
        </p>
      </div>

      {/* Info Bar Settings */}
      {infoBarSettings && (
        <InfoBarSettings initialSettings={infoBarSettings} locale={locale} />
      )}
    </div>
  );
}
