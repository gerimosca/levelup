import { requireAdmin } from '@/shared/auth';
import { AdminLayout } from '@/features/admin/components/admin-layout';

interface AdminRouteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Admin Layout
 *
 * Protects all /admin routes with requireAdmin() guard.
 * Only users with 'admin' or 'super_admin' flag can access.
 * Redirects to /dashboard if not admin.
 */
export default async function AdminRouteLayout({
  children,
  params,
}: AdminRouteLayoutProps) {
  const { locale } = await params;
  const user = await requireAdmin(locale);

  return <AdminLayout user={user}>{children}</AdminLayout>;
}
