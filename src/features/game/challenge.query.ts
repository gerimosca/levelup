import { createClient } from '@supabase/supabase-js';
import { createClientServer } from '@/shared/database/supabase';
import { levelFromTotalXp } from '@/game-core';
import type { ChallengeView, ChallengeMemberView } from './types';

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function getUserChallenge(
  userId: string,
  todayDate: string,
): Promise<ChallengeView | null> {
  const supabase = await createClientServer();

  // Reto más reciente del usuario
  const { data: membership } = await supabase
    .from('challenge_members')
    .select('challenge_id')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership) return null;
  const challengeId = membership.challenge_id;

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, name, invite_code, created_by')
    .eq('id', challengeId)
    .single();

  if (!challenge) return null;

  const svc = serviceClient();

  const { data: rawMembers } = await svc
    .from('challenge_members')
    .select('user_id')
    .eq('challenge_id', challengeId);

  const memberIds = (rawMembers ?? []).map((m) => m.user_id as string);
  if (!memberIds.length) return null;

  const [profilesRes, psRes, streakRes, spRes, logsRes] = await Promise.all([
    svc.from('profiles').select('id, email, avatar_url').in('id', memberIds),
    svc.from('player_state').select('user_id, xp_total, current_season_key').in('user_id', memberIds),
    svc.from('streaks').select('user_id, current').in('user_id', memberIds),
    svc.from('season_progress').select('user_id, season_key, days_completed').in('user_id', memberIds),
    svc.from('habit_logs').select('user_id').in('user_id', memberIds).eq('day_date', todayDate).neq('habit_key', 'mission_complete'),
  ]);

  const profiles  = profilesRes.data  ?? [];
  const pStates   = psRes.data        ?? [];
  const streaks   = streakRes.data    ?? [];
  const sProgresses = spRes.data      ?? [];
  const todaySet  = new Set((logsRes.data ?? []).map((l) => l.user_id as string));

  const members: ChallengeMemberView[] = memberIds.map((uid) => {
    const prof   = profiles.find((p) => p.id === uid);
    const ps     = pStates.find((p) => p.user_id === uid);
    const streak = streaks.find((s) => s.user_id === uid);
    const sp     = sProgresses.find(
      (s) => s.user_id === uid && s.season_key === ps?.current_season_key,
    );
    const level = ps ? levelFromTotalXp(ps.xp_total as number).level : 1;

    return {
      userId: uid,
      displayName: (prof?.email as string | null)?.split('@')[0] ?? 'Hero',
      avatarUrl: (prof?.avatar_url as string | null) ?? null,
      seasonKey: (ps?.current_season_key as string | null) ?? 's1-reset',
      daysCompleted: (sp?.days_completed as number | null) ?? 0,
      streak: (streak?.current as number | null) ?? 0,
      level,
      loggedToday: todaySet.has(uid),
      isMe: uid === userId,
    };
  });

  // Ordenar: logged today primero → racha mayor
  members.sort((a, b) => {
    if (a.loggedToday !== b.loggedToday) return a.loggedToday ? -1 : 1;
    return b.streak - a.streak;
  });

  return {
    id: challenge.id as string,
    name: challenge.name as string,
    inviteCode: challenge.invite_code as string,
    createdBy: challenge.created_by as string,
    isOwner: challenge.created_by === userId,
    members,
  };
}

export async function getChallengeByCode(
  code: string,
): Promise<{ id: string; name: string } | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('challenges')
    .select('id, name')
    .eq('invite_code', code.toUpperCase().trim())
    .maybeSingle();
  return data ? { id: data.id as string, name: data.name as string } : null;
}

export async function isAlreadyMember(
  userId: string,
  challengeId: string,
): Promise<boolean> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('challenge_members')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .maybeSingle();
  return !!data;
}
