/**
 * GET /api/push/streak-reminder
 * Cron job: notifica a usuarios con racha activa que aún no han reclamado
 * ningún hábito hoy. Diseñado para lanzarse ≈ 20:00 UTC.
 *
 * Authorization: Bearer {CRON_SECRET}
 */
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const vapidSubject = process.env.VAPID_EMAIL?.startsWith('mailto:') || process.env.VAPID_EMAIL?.startsWith('https://')
  ? process.env.VAPID_EMAIL!
  : `mailto:${process.env.VAPID_EMAIL}`;

webpush.setVapidDetails(
  vapidSubject,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();
  const todayUtc = now.toISOString().slice(0, 10);
  const currentUtcHour = now.getUTCHours();

  // 1. Usuarios cuyo reminder_hour coincide con la hora UTC actual.
  const { data: candidates } = await supabase
    .from('push_subscriptions')
    .select('id, user_id, subscription')
    .not('user_id', 'is', null)
    .eq('reminder_hour', currentUtcHour);

  if (!candidates?.length) return NextResponse.json({ sent: 0 });

  const userIds = candidates.map((c) => c.user_id as string);

  // 2. De esos usuarios, cuáles tienen racha activa.
  const { data: streakRows } = await supabase
    .from('streaks')
    .select('user_id, current')
    .in('user_id', userIds)
    .gt('current', 0);

  const usersWithStreak = new Set((streakRows ?? []).map((r) => r.user_id as string));

  // 3. De esos, cuáles ya reclamaron algún hábito hoy.
  const usersWithStreak_arr = [...usersWithStreak];
  if (!usersWithStreak_arr.length) return NextResponse.json({ sent: 0, reason: 'no active streaks' });

  const { data: claimedToday } = await supabase
    .from('habit_logs')
    .select('user_id')
    .in('user_id', usersWithStreak_arr)
    .eq('day_date', todayUtc);

  const alreadyClaimed = new Set((claimedToday ?? []).map((r) => r.user_id as string));

  // 4. At-risk = racha activa + sin ningún claim hoy.
  const atRisk = candidates.filter(
    (c) => usersWithStreak.has(c.user_id as string) && !alreadyClaimed.has(c.user_id as string),
  );

  if (!atRisk.length) return NextResponse.json({ sent: 0, reason: 'all streaks safe' });

  // 5. Enviar push a at-risk.
  const streak = (userId: string) =>
    streakRows?.find((r) => r.user_id === userId)?.current ?? 0;

  const staleIds: string[] = [];
  let sent = 0;

  await Promise.all(
    atRisk.map(async (row) => {
      const days = streak(row.user_id as string);
      const payload = JSON.stringify({
        title: `⚠️ ${days}-day streak at risk`,
        body: "You haven't logged any habit today. Don't break the chain!",
        url: '/home',
        tag: 'streak-reminder',
      });
      try {
        await webpush.sendNotification(row.subscription as webpush.PushSubscription, payload);
        sent++;
      } catch (err: unknown) {
        if ((err as { statusCode?: number }).statusCode === 410) {
          staleIds.push(row.id as string);
        }
      }
    }),
  );

  if (staleIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds);
  }

  return NextResponse.json({ sent, atRisk: atRisk.length, stale: staleIds.length });
}
