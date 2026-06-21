import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { InfoBarSettingsForm } from '@/features/admin/components/info-bar-settings-form';
import { getInfoBarSettings } from '@/features/admin/admin.query';
import { Info } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.infoBar' });

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function InfoBarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.infoBar' });

  // Fetch current info-bar settings
  const settings = await getInfoBarSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Info className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      {/* Info-Bar Settings Form */}
      <InfoBarSettingsForm initialSettings={settings} locale={locale} />
    </div>
  );
}
