import { getTranslations } from 'next-intl/server';
import { EmailJourneysControl } from '@/features/admin/components/email-journeys-control';
import { getEmailJourneysSettings } from '@/features/admin/admin.query';

interface AdminEmailsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminEmailsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.emails.page' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AdminEmailsPage({
  params,
}: AdminEmailsPageProps) {
  const { locale } = await params;
  const emailJourneys = await getEmailJourneysSettings();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Email Journeys
        </h1>
        <p className="text-muted-foreground">
          Control automated email campaigns and notifications
        </p>
      </div>

      {/* Email Journeys Control */}
      {emailJourneys && (
        <EmailJourneysControl
          initialJourneys={emailJourneys}
          locale={locale}
        />
      )}
    </div>
  );
}
