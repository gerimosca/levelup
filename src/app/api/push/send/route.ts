import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentHour = new Date().getUTCHours();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('reminder_hour', currentHour);

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const payload = JSON.stringify({
    title: 'LevelUP ⚔️',
    body: 'Your hero awaits — complete today\'s habits!',
    url: '/',
  });

  const staleIds: string[] = [];
  let sent = 0;

  await Promise.all(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(
          row.subscription as webpush.PushSubscription,
          payload,
        );
        sent++;
      } catch (err: unknown) {
        // 410 = subscription expired, remove it
        if ((err as { statusCode?: number }).statusCode === 410) {
          staleIds.push(row.id as string);
        }
      }
    }),
  );

  if (staleIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds);
  }

  return NextResponse.json({ sent, stale: staleIds.length });
}
