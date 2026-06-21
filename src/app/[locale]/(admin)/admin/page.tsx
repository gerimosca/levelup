import { getTranslations } from 'next-intl/server';
import { StatsDashboard } from '@/features/admin/components/stats-dashboard';
// import { CrossSellPanel } from '@/features/admin/components/cross-sell-panel';
import { FunnelMetrics } from '@/features/admin/components/funnel-metrics';
import { UTMPerformance } from '@/features/admin/components/utm-performance';
import { getAdminStats } from '@/features/admin/admin.query';

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminDashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.page' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { locale } = await params;

  // Fetch stats
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your SaaS, view stats, and configure settings
        </p>
      </div>

      {/* Stats Dashboard */}
      <StatsDashboard stats={stats} />

      {/* Conversion Funnel */}
      <FunnelMetrics />

      {/* UTM Performance */}
      <UTMPerformance />

      {/* Cross-Sell Panel - Commented out for now */}
      {/* {crossSellProducts && (
        <CrossSellPanel products={crossSellProducts.products} />
      )} */}
    </div>
  );
}
