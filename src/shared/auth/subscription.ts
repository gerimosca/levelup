import { redirect } from 'next/navigation';
import { hasActiveSubscription } from '@/features/billing';
import { requireUser } from './session';

/**
 * Check if user has an active subscription
 * Returns true if subscription status is 'active' or 'trialing'
 */
export { hasActiveSubscription } from '@/features/billing';

/**
 * Require an active subscription - redirects to pricing if not subscribed
 * Use in server components that require a paid subscription
 */
export async function requireSubscription(
  locale: string = 'en'
): Promise<void> {
  const user = await requireUser(locale);

  const isSubscribed = await hasActiveSubscription(user.id);

  if (!isSubscribed) {
    redirect(`/${locale}/pricing`);
  }
}

/**
 * Combined check for user and subscription
 * Returns the user if authenticated and subscribed
 */
export async function requireUserWithSubscription(locale: string = 'en') {
  const user = await requireUser(locale);

  const isSubscribed = await hasActiveSubscription(user.id);

  if (!isSubscribed) {
    redirect(`/${locale}/pricing`);
  }

  return user;
}
