import { MarketingLayout } from '@/shared/components/layouts';
import { PageTracker } from '@/features/analytics/page-tracker';
import { MarketingLayoutServer } from '@/shared/components/layouts/marketing-layout-server';

export default function MarketingRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingLayout>
      <PageTracker userId={null} />
      {children}
    </MarketingLayout>
  );
  return <MarketingLayoutServer>{children}</MarketingLayoutServer>;
}
