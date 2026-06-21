import { createClientServer } from '@/shared/database/supabase';

export async function getUserPushSubscription(
  userId: string,
): Promise<{ endpoint: string; reminder_hour: number } | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('push_subscriptions')
    .select('endpoint, reminder_hour')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
