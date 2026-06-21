import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireUser } from '@/shared/auth';
import {
  getSubscription,
  SubscriptionCard,
  BillingActions,
} from '@/features/billing';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface BillingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { locale } = await params;
  const t = await getTranslations('billing');
  const user = await requireUser(locale);
  const subscription = await getSubscription(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {subscription ? (
        <div className="space-y-6">
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
            <CardTitle>{t('subscription')}</CardTitle>
            <CardDescription>{t('currentPlan')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">{t('noSubscription')}</p>
              <Button asChild>
                <Link href={`/${locale}/pricing`}>{t('viewPlans')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
