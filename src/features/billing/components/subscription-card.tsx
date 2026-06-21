'use client';

import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type { SubscriptionStatus } from '../types';

type SubscriptionCardProps = {
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  locale?: string;
};

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  trialing: {
    label: 'Trial',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  past_due: {
    label: 'Payment Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  canceled: {
    label: 'Canceled',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
  },
  unpaid: {
    label: 'Unpaid',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  incomplete: {
    label: 'Incomplete',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  incomplete_expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400',
  },
  paused: {
    label: 'Paused',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
};

export function SubscriptionCard({
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  locale = 'en',
}: SubscriptionCardProps) {
  const t = useTranslations('billing');
  const config = statusConfig[status];

  const periodEndDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('subscription')}</CardTitle>
            <CardDescription>{t('currentPlan')}</CardDescription>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Billing period info */}
        {periodEndDate && (
          <div className="text-sm text-muted-foreground">
            {cancelAtPeriodEnd ? (
              <span className="text-destructive">
                {t('cancelsOn', { date: periodEndDate })}
              </span>
            ) : status === 'trialing' ? (
              <span>{t('trialEnds', { date: periodEndDate })}</span>
            ) : (
              <span>{t('renewsOn', { date: periodEndDate })}</span>
            )}
          </div>
        )}

        {/* Payment failed warning */}
        {status === 'past_due' && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {t('paymentFailed')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
