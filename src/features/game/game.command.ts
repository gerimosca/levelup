import { createClientServer } from '@/shared/database/supabase';
import type { AttributeType, PetMood, PetStage, SeasonDef } from '@/game-core';

/**
 * Crea las filas de juego que falten para un usuario (idempotente).
 * player_state dispara el trigger que siembra los 5 atributos.
 */
export async function ensureGameRows(userId: string, season: SeasonDef): Promise<void> {
  const supabase = await createClientServer();

  await supabase
    .from('player_state')
    .upsert(
      { user_id: userId, current_season_key: season.key },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

  await supabase
    .from('streaks')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

  await supabase
    .from('enemy_state')
    .upsert(
      {
        user_id: userId,
        season_key: season.key,
        hp_current: season.enemy.hpMax,
        hp_max: season.enemy.hpMax,
      },
      { onConflict: 'user_id,season_key', ignoreDuplicates: true },
    );

  await supabase
    .from('season_progress')
    .upsert(
      { user_id: userId, season_key: season.key },
      { onConflict: 'user_id,season_key', ignoreDuplicates: true },
    );

  await supabase
    .from('pet')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });
}

/** Inserta un registro de hábito. Devuelve false si ya existía (idempotencia). */
export async function insertHabitLog(
  userId: string,
  habitKey: string,
  dayDate: string,
  value: number,
  xpAwarded: number,
): Promise<boolean> {
  const supabase = await createClientServer();
  const { error } = await supabase.from('habit_logs').insert({
    user_id: userId,
    habit_key: habitKey,
    day_date: dayDate,
    value,
    xp_awarded: xpAwarded,
  });
  return !error; // unique violation (ya reclamado) → false
}

export async function updatePlayerXp(
  userId: string,
  xpTotal: number,
  level: number,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('player_state')
    .update({ xp_total: xpTotal, level })
    .eq('user_id', userId);
}

export async function incrementAttribute(
  userId: string,
  type: AttributeType,
  points: number,
): Promise<void> {
  const supabase = await createClientServer();
  const { data } = await supabase
    .from('attributes')
    .select('points')
    .eq('user_id', userId)
    .eq('type', type)
    .maybeSingle();
  const current = (data as { points: number } | null)?.points ?? 0;
  await supabase
    .from('attributes')
    .upsert(
      { user_id: userId, type, points: current + points },
      { onConflict: 'user_id,type' },
    );
}

export async function updateEnemyHp(
  userId: string,
  seasonKey: string,
  hpCurrent: number,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('enemy_state')
    .update({ hp_current: hpCurrent })
    .eq('user_id', userId)
    .eq('season_key', seasonKey);
}

export async function updateStreak(
  userId: string,
  current: number,
  longest: number,
  lastActiveDay: string,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('streaks')
    .update({ current, longest, last_active_day: lastActiveDay })
    .eq('user_id', userId);
}

export async function updateSeasonProgress(
  userId: string,
  seasonKey: string,
  daysCompleted: number,
  completed: boolean,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('season_progress')
    .update({
      days_completed: daysCompleted,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
    .eq('season_key', seasonKey);
}

export async function updatePet(
  userId: string,
  stage: PetStage,
  careDays: number,
  mood: PetMood,
  shields: number,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('pet')
    .update({
      stage,
      care_days: careDays,
      mood,
      shields,
      last_interaction: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

export async function saveActiveHabits(
  userId: string,
  habits: string[],
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('player_state')
    .update({ active_habits: habits })
    .eq('user_id', userId);
}

export async function upsertJournalEntry(
  userId: string,
  dayDate: string,
  mood: string | null,
  felt: string,
  learned: string,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase.from('journal_entries').upsert(
    {
      user_id: userId,
      day_date: dayDate,
      mood,
      felt_text: felt,
      learned_text: learned,
    },
    { onConflict: 'user_id,day_date' },
  );
}

/** Marca la cinemática de victoria de una temporada como vista (por cuenta). */
export async function markVictorySeen(
  userId: string,
  seasonKey: string,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('season_progress')
    .update({ victory_seen_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('season_key', seasonKey);
}

export async function saveEconomySettings(
  userId: string,
  beerPrice: number,
  beersPerDay: number,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('player_state')
    .update({ beer_price: beerPrice, beers_per_day: beersPerDay })
    .eq('user_id', userId);
}

export async function startExpedition(
  userId: string,
  departedAt: string,
  readyAt: string,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('expeditions')
    .upsert(
      { user_id: userId, active: true, departed_at: departedAt, ready_at: readyAt },
      { onConflict: 'user_id' },
    );
}

export async function finishExpedition(userId: string): Promise<void> {
  const supabase = await createClientServer();
  await supabase.from('expeditions').update({ active: false }).eq('user_id', userId);
}

/** Suma materiales al inventario (deltas por clave). */
export async function addMaterials(
  userId: string,
  deltas: Record<string, number>,
): Promise<void> {
  const supabase = await createClientServer();
  for (const [key, delta] of Object.entries(deltas)) {
    if (!delta) continue;
    const { data } = await supabase
      .from('inventory')
      .select('qty')
      .eq('user_id', userId)
      .eq('item_key', key)
      .maybeSingle();
    const current = (data as { qty: number } | null)?.qty ?? 0;
    await supabase
      .from('inventory')
      .upsert(
        { user_id: userId, item_key: key, qty: Math.max(0, current + delta) },
        { onConflict: 'user_id,item_key' },
      );
  }
}

export async function addDiscovery(userId: string, discoveryKey: string): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('discoveries')
    .upsert(
      { user_id: userId, discovery_key: discoveryKey },
      { onConflict: 'user_id,discovery_key', ignoreDuplicates: true },
    );
}

export async function buildStructure(userId: string, structureKey: string): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('camp_structures')
    .upsert(
      { user_id: userId, structure_key: structureKey, level: 1 },
      { onConflict: 'user_id,structure_key', ignoreDuplicates: true },
    );
}

/** Borra TODOS los datos de juego del usuario (reinicio total). */
export async function deleteAllGameData(userId: string): Promise<void> {
  const supabase = await createClientServer();
  const tables = [
    'habit_logs',
    'attributes',
    'streaks',
    'season_progress',
    'enemy_state',
    'pet',
    'achievements',
    'equipment',
    'daily_event',
    'journal_entries',
    'expeditions',
    'inventory',
    'camp_structures',
    'discoveries',
    'player_state',
  ];
  for (const table of tables) {
    await supabase.from(table).delete().eq('user_id', userId);
  }
}

/** Quita el equipado de todos los items de un slot. */
export async function clearEquippedSlot(userId: string, slot: string): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('equipment')
    .update({ equipped_slot: null })
    .eq('user_id', userId)
    .eq('equipped_slot', slot);
}

/** Marca un item equipado en un slot (o lo desequipa con slot=null). */
export async function upsertEquipped(
  userId: string,
  itemKey: string,
  slot: string | null,
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('equipment')
    .upsert(
      { user_id: userId, item_key: itemKey, equipped_slot: slot },
      { onConflict: 'user_id,item_key' },
    );
}

export async function unlockAchievements(
  userId: string,
  keys: string[],
): Promise<void> {
  if (keys.length === 0) return;
  const supabase = await createClientServer();
  await supabase
    .from('achievements')
    .upsert(
      keys.map((achievement_key) => ({ user_id: userId, achievement_key })),
      { onConflict: 'user_id,achievement_key', ignoreDuplicates: true },
    );
}

export async function updateAvatarConfig(
  userId: string,
  config: { skinKey?: string; hairKey?: string },
): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('player_state')
    .update({ avatar_config: config })
    .eq('user_id', userId);
}

/** Mueve al jugador a la siguiente temporada y crea sus filas (idempotente). */
export async function advanceToNextSeason(userId: string, nextSeason: SeasonDef): Promise<void> {
  const supabase = await createClientServer();
  await supabase
    .from('player_state')
    .update({ current_season_key: nextSeason.key })
    .eq('user_id', userId);
  await supabase
    .from('enemy_state')
    .upsert(
      {
        user_id: userId,
        season_key: nextSeason.key,
        hp_current: nextSeason.enemy.hpMax,
        hp_max: nextSeason.enemy.hpMax,
      },
      { onConflict: 'user_id,season_key', ignoreDuplicates: true },
    );
  await supabase
    .from('season_progress')
    .upsert(
      { user_id: userId, season_key: nextSeason.key },
      { onConflict: 'user_id,season_key', ignoreDuplicates: true },
    );
}
