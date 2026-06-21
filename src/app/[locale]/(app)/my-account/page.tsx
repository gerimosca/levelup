import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ProfileForm, getProfileAction } from '@/features/my-account';
import {
  getSubscription,
  SubscriptionCard,
  BillingActions,
} from '@/features/billing';
import { requireUser } from '@/shared/auth';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface MyAccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MyAccountPage({ params }: MyAccountPageProps) {
  const { locale } = await params;
  const t = await getTranslations('myAccount');
  const tBilling = await getTranslations('billing');
  const user = await requireUser(locale);
  const { profile } = await getProfileAction();
  const subscription = await getSubscription(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      {/* Profile Section */}
      <ProfileForm profile={profile} />

      {/* Billing Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{tBilling('title')}</h2>
        {subscription ? (
          <div className="space-y-4">
            <SubscriptionCard
              status={subscription.status}
              currentPeriodEnd={subscription.current_period_end}
              cancelAtPeriodEnd={subscription.cancel_at_period_end}
              locale={locale}
            />
            <BillingActions hasSubscription={true} />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{tBilling('subscription')}</CardTitle>
              <CardDescription>{tBilling('currentPlan')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">{tBilling('noSubscription')}</p>
                <Button asChild>
                  <Link href={`/${locale}/pricing`}>{tBilling('viewPlans')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
