'use server';

import { getUser } from '@/shared/auth';
import { upsertPushSubscription, deletePushSubscription } from './push.command';
import { getUserPushSubscription } from './push.query';
import type { SerializedPushSubscription } from './push.types';

export async function subscribePushAction(
  subscription: SerializedPushSubscription,
  reminderHour: number,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };
  if (reminderHour < 0 || reminderHour > 23) return { success: false, error: 'Invalid hour' };
  await upsertPushSubscription(user.id, subscription, reminderHour);
  return { success: true };
}

export async function unsubscribePushAction(
  endpoint: string,
): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };
  await deletePushSubscription(user.id, endpoint);
  return { success: true };
}

export async function getPushSubscriptionAction(): Promise<{
  endpoint: string | null;
  reminderHour: number | null;
}> {
  const user = await getUser();
  if (!user) return { endpoint: null, reminderHour: null };
  const sub = await getUserPushSubscription(user.id);
  return { endpoint: sub?.endpoint ?? null, reminderHour: sub?.reminder_hour ?? null };
}
