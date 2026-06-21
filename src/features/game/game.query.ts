import { createClientServer } from '@/shared/database/supabase';
import type { AchievementStats } from '@/game-core';
import { MC_BONUS_KEY } from './types';

/** Pasos por kilómetro (aprox) para estimar km caminados. */
const STEPS_PER_KM = 1312;

export interface PlayerRow {
  level: number;
  xp_total: number;
  current_season_key: string;
  active_habits: string[];
  beer_price: number;
  beers_per_day: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  avatar_config?: Record<string, any> | null;
}

export async function getPlayerRow(userId: string): Promise<PlayerRow | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('player_state')
    .select('level, xp_total, current_season_key, active_habits, beer_price, beers_per_day, avatar_config')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as PlayerRow | null) ?? null;
}

/** ¿Hay una recaída registrada en ese día? */
export async function hasRelapseOn(userId: string, dayDate: string): Promise<boolean> {
  const supabase = await createClientServer();
  const { count } = await supabase
    .from('habit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('habit_key', '__relapse__')
    .eq('day_date', dayDate);
  return (count ?? 0) > 0;
}

export async function getAttributesMap(
  userId: string,
): Promise<Record<string, number>> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('attributes')
    .select('type, points')
    .eq('user_id', userId);
  const map: Record<string, number> = {};
  for (const row of (data as { type: string; points: number }[] | null) ?? []) {
    map[row.type] = row.points;
  }
  return map;
}

export async function getClaimedHabitKeys(
  userId: string,
  dayDate: string,
): Promise<string[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('habit_logs')
    .select('habit_key')
    .eq('user_id', userId)
    .eq('day_date', dayDate);
  return ((data as { habit_key: string }[] | null) ?? []).map((r) => r.habit_key);
}

export interface StreakRow {
  current: number;
  longest: number;
  last_active_day: string | null;
}

export async function getStreakRow(userId: string): Promise<StreakRow | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('streaks')
    .select('current, longest, last_active_day')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as StreakRow | null) ?? null;
}

export interface EnemyRow {
  hp_current: number;
  hp_max: number;
}

export async function getEnemyRow(
  userId: string,
  seasonKey: string,
): Promise<EnemyRow | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('enemy_state')
    .select('hp_current, hp_max')
    .eq('user_id', userId)
    .eq('season_key', seasonKey)
    .maybeSingle();
  return (data as EnemyRow | null) ?? null;
}

export interface SeasonProgressRow {
  days_completed: number;
  completed_at: string | null;
  victory_seen_at: string | null;
}

export async function getSeasonProgressRow(
  userId: string,
  seasonKey: string,
): Promise<SeasonProgressRow | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('season_progress')
    .select('days_completed, completed_at, victory_seen_at')
    .eq('user_id', userId)
    .eq('season_key', seasonKey)
    .maybeSingle();
  return (data as SeasonProgressRow | null) ?? null;
}

export interface PetRow {
  stage: string;
  care_days: number;
  mood: string;
  last_interaction: string | null;
  shields: number;
}

export async function getPetRow(userId: string): Promise<PetRow | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('pet')
    .select('stage, care_days, mood, last_interaction, shields')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as PetRow | null) ?? null;
}

export async function getEquipmentRows(
  userId: string,
): Promise<{ item_key: string; equipped_slot: string | null }[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('equipment')
    .select('item_key, equipped_slot')
    .eq('user_id', userId);
  return (data as { item_key: string; equipped_slot: string | null }[] | null) ?? [];
}

export async function getUnlockedAchievementKeys(userId: string): Promise<string[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('achievements')
    .select('achievement_key')
    .eq('user_id', userId);
  return ((data as { achievement_key: string }[] | null) ?? []).map(
    (r) => r.achievement_key,
  );
}

async function countHabitLogs(userId: string, habitKey: string): Promise<number> {
  const supabase = await createClientServer();
  const { count } = await supabase
    .from('habit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('habit_key', habitKey);
  return count ?? 0;
}

async function sumHabitValue(userId: string, habitKey: string): Promise<number> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('habit_logs')
    .select('value')
    .eq('user_id', userId)
    .eq('habit_key', habitKey);
  return ((data as { value: number }[] | null) ?? []).reduce(
    (sum, r) => sum + Number(r.value),
    0,
  );
}

async function countCompletedSeasons(userId: string): Promise<number> {
  const supabase = await createClientServer();
  const { count } = await supabase
    .from('season_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null);
  return count ?? 0;
}

async function countPerfectWeeks(userId: string): Promise<number> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('habit_logs')
    .select('day_date')
    .eq('user_id', userId);
  if (!data || data.length === 0) return 0;

  const dates = [...new Set(data.map((r) => r.day_date))].sort();
  const weekMap = new Map<string, number>();
  for (const date of dates) {
    const d = new Date(`${date}T12:00:00`);
    const dow = d.getDay(); // 0=Sun
    const diff = dow === 0 ? -6 : 1 - dow; // shift to Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    const key = monday.toISOString().split('T')[0];
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
  }
  let count = 0;
  for (const v of weekMap.values()) if (v === 7) count++;
  return count;
}

/** Snapshot agregado para evaluar logros (algunas métricas son aproximadas). */
export async function getAchievementStats(
  userId: string,
  level: number,
  longestStreak: number,
): Promise<AchievementStats> {
  const [trainings, alcoholFreeDays, reads, steps, seasonsCompleted, perfectWeeks] =
    await Promise.all([
      countHabitLogs(userId, 'train'),
      countHabitLogs(userId, 'no_alcohol'),
      countHabitLogs(userId, 'read'),
      sumHabitValue(userId, 'steps'),
      countCompletedSeasons(userId),
      countPerfectWeeks(userId),
    ]);

  return {
    level,
    trainings,
    alcoholFreeDays,
    reads,
    kmWalked: steps / STEPS_PER_KM,
    longestStreak,
    seasonsCompleted,
    perfectWeeks,
  };
}

/** Registros de hábitos desde una fecha (para la gráfica de constancia). */
export async function getRecentHabitLogs(
  userId: string,
  sinceDate: string,
): Promise<{ day_date: string; habit_key: string }[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('habit_logs')
    .select('day_date, habit_key')
    .eq('user_id', userId)
    .gte('day_date', sinceDate);
  return (data as { day_date: string; habit_key: string }[] | null) ?? [];
}

/** Registros de hábitos con XP desde una fecha (para gráfica de XP semanal y tendencias). */
export async function getRecentHabitXpLogs(
  userId: string,
  sinceDate: string,
): Promise<{ day_date: string; habit_key: string; xp_awarded: number }[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('habit_logs')
    .select('day_date, habit_key, xp_awarded')
    .eq('user_id', userId)
    .gte('day_date', sinceDate)
    .order('day_date');
  return (
    (data as { day_date: string; habit_key: string; xp_awarded: number }[] | null) ?? []
  );
}

/** Reúne todos los datos de juego del usuario (export). */
export async function getAllGameData(userId: string): Promise<Record<string, unknown[]>> {
  const supabase = await createClientServer();
  const tables = [
    'player_state',
    'attributes',
    'habit_logs',
    'streaks',
    'season_progress',
    'enemy_state',
    'pet',
    'achievements',
    'equipment',
    'daily_event',
  ];
  const result: Record<string, unknown[]> = {};
  for (const table of tables) {
    const { data } = await supabase.from(table).select('*').eq('user_id', userId);
    result[table] = (data as unknown[] | null) ?? [];
  }
  return result;
}

export interface ExpeditionRow {
  active: boolean;
  departed_at: string | null;
  ready_at: string | null;
}

export async function getExpedition(userId: string): Promise<ExpeditionRow | null> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('expeditions')
    .select('active, departed_at, ready_at')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as ExpeditionRow | null) ?? null;
}

export async function getInventory(userId: string): Promise<Record<string, number>> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('inventory')
    .select('item_key, qty')
    .eq('user_id', userId);
  const inv: Record<string, number> = {};
  for (const r of (data as { item_key: string; qty: number }[] | null) ?? []) {
    inv[r.item_key] = r.qty;
  }
  return inv;
}

export async function getCampStructures(userId: string): Promise<string[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('camp_structures')
    .select('structure_key')
    .eq('user_id', userId);
  return ((data as { structure_key: string }[] | null) ?? []).map((r) => r.structure_key);
}

export async function getDiscoveries(userId: string): Promise<string[]> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('discoveries')
    .select('discovery_key')
    .eq('user_id', userId);
  return ((data as { discovery_key: string }[] | null) ?? []).map((r) => r.discovery_key);
}

export { MC_BONUS_KEY };
