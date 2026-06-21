import { AppLayout } from '@/shared/components/layouts';
import { AppProvider } from '@/shared/providers';
import { getUser, isAdmin } from '@/shared/auth';
import { getSubscription } from '@/features/billing/billing.query';
import type { AppSubscription } from '@/shared/providers/app-provider';
import { PageTracker } from '@/features/analytics/page-tracker';

export default async function AppRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Check if user is admin
  const userIsAdmin = user ? await isAdmin() : false;

  // Fetch subscription if user exists
  const subscriptionData = user ? await getSubscription(user.id) : null;

  // Map to AppSubscription format
  const subscription: AppSubscription | null = subscriptionData
    ? {
        plan: (subscriptionData.stripe_price_id?.includes('pro')
          ? 'pro'
          : subscriptionData.stripe_price_id?.includes('enterprise')
            ? 'enterprise'
            : 'free') as 'free' | 'pro' | 'enterprise',
        status: subscriptionData.status as
          | 'active'
          | 'canceled'
          | 'past_due'
          | 'trialing',
        features: [],
        current_period_end: subscriptionData.current_period_end ?? undefined,
      }
    : null;

  return (
    <AppProvider
      initialState={{
        user: user
          ? {
              id: user.id,
              email: user.email,
              avatar_url: user.avatar,
            }
          : null,
        subscription,
        credits: 0,
      }}
    >
      <AppLayout
        user={{
          email: user?.email,
          avatar_url: user?.avatar,
        }}
        isAdmin={userIsAdmin}
      >
        <PageTracker userId={user?.id} />
        {children}
      </AppLayout>
    </AppProvider>
  );
}
