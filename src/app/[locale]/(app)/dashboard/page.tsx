import { useTranslations } from 'next-intl';
import { DashboardStatsCards, getDashboardDataAction } from '@/features/dashboard';
import { requireUser } from '@/shared/auth';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  await requireUser(locale);
  const { stats } = await getDashboardDataAction();

  return <DashboardContent stats={stats} />;
}

function DashboardContent({ stats }: { stats: Parameters<typeof DashboardStatsCards>[0]['stats'] }) {
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('welcome')}</p>
      </div>
      <DashboardStatsCards stats={stats} />
    </div>
  );
}
