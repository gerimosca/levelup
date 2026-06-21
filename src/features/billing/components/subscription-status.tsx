import { getSubscription } from '../billing.query';
import type { SubscriptionStatus } from '../types';

type SubscriptionStatusBadgeProps = {
  userId: string;
};

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  active: {
    label: 'Pro',
    className: 'bg-green-100 text-green-800',
  },
  trialing: {
    label: 'Trial',
    className: 'bg-blue-100 text-blue-800',
  },
  past_due: {
    label: 'Payment Failed',
    className: 'bg-red-100 text-red-800',
  },
  canceled: {
    label: 'Canceled',
    className: 'bg-gray-100 text-gray-800',
  },
  unpaid: {
    label: 'Unpaid',
    className: 'bg-red-100 text-red-800',
  },
  incomplete: {
    label: 'Incomplete',
    className: 'bg-yellow-100 text-yellow-800',
  },
  incomplete_expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-800',
  },
  paused: {
    label: 'Paused',
    className: 'bg-yellow-100 text-yellow-800',
  },
};

export async function SubscriptionStatusBadge({
  userId,
}: SubscriptionStatusBadgeProps) {
  const subscription = await getSubscription(userId);

  if (!subscription) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Free
      </span>
    );
  }

  const config = statusConfig[subscription.status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
