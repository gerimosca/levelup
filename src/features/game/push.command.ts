import { createClientServer } from '@/shared/database/supabase';
import type { SerializedPushSubscription } from './push.types';

export async function upsertPushSubscription(
  userId: string,
  subscription: SerializedPushSubscription,
  reminderHour: number,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      subscription,
      reminder_hour: reminderHour,
    },
    { onConflict: 'user_id,endpoint' },
  );
}

export async function deletePushSubscription(userId: string, endpoint: string): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);
}
