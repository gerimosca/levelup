import {
  SEASONS,
  FIRST_SEASON,
  getSeason,
  getHabit,
  HABIT_LIST,
  calculateHabitXp,
  applyMultipliers,
  levelFromTotalXp,
  streakMultiplier,
  nextStreak,
  attributePointsForHabit,
  attributeRank,
  attributeRankProgress,
  dominantAttribute,
  applyDayCompleted,
  applyHabitDamage,
  applySetback,
  evaluateTitles,
  eventMultiplierForHabit,
  eventEnemyMultiplier,
  selectDailyEvent,
  generateDailyMissions,
  allMissionsComplete,
  MISSION_COMPLETE_BONUS,
  petStageForCareDays,
  petMood,
  maxShieldsForStage,
  SHIELD_EARN_EVERY,
  zoneForDay,
  advanceSeasonDay,
  evaluateAchievements,
  tierForLevel,
  EQUIPMENT,
  EQUIPMENT_BY_KEY,
  CHEST_LOOT,
  RARITY,
  EXPEDITION_HOURS,
  MATERIAL_PER_HABIT,
  computeExpeditionReward,
  computeExpeditionDiscovery,
  nextStructure,
  canAfford,
  CAMP_STRUCTURES_BY_KEY,
  DEFAULT_BEER_PRICE,
  DEFAULT_BEERS_PER_DAY,
  CRAFTABLE_BY_KEY,
  type AttributeType,
  type DailyEventContext,
  type HabitKey,
  type PetMood,
  type PetStage,
  type SeasonDef,
} from '@/game-core';
import {
  claimHabitSchema,
  saveActiveHabitsSchema,
  MC_BONUS_KEY,
  RELAPSE_KEY,
  type AvatarConfig,
  type BuildResult,
  type ChestRewardResult,
  type ClaimExpeditionResult,
  type ClaimHabitInput,
  type ClaimResult,
  type EconomySettings,
  type EquippedSlots,
  type MissionView,
  type ProfileView,
  type RelapseResult,
  type SaveActiveHabitsInput,
  type SaveEconomyInput,
  type StatsView,
  type TodayState,
} from './types';
import { saveEconomySchema } from './types';
import {
  getPlayerRow,
  getClaimedHabitKeys,
  getStreakRow,
  getEnemyRow,
  getSeasonProgressRow,
  getPetRow,
  getUnlockedAchievementKeys,
  getAchievementStats,
  getAttributesMap,
  getAllGameData,
  getEquipmentRows,
  getRecentHabitLogs,
  getRecentHabitXpLogs,
  getExpedition,
  getInventory,
  getCampStructures,
  getDiscoveries,
  hasRelapseOn,
  type PlayerRow,
} from './game.query';
import {
  ensureGameRows,
  insertHabitLog,
  updatePlayerXp,
  incrementAttribute,
  updateEnemyHp,
  updateStreak,
  updateSeasonProgress,
  updatePet,
  unlockAchievements,
  saveActiveHabits,
  saveEconomySettings,
  markVictorySeen,
  clearEquippedSlot,
  upsertEquipped,
  startExpedition,
  finishExpedition,
  addMaterials,
  buildStructure,
  addDiscovery,
  deleteAllGameData,
  updateAvatarConfig,
  advanceToNextSeason,
} from './game.command';
import { isWeekendISO, daysBetweenISO, addDaysISO } from './lib';

const VALID_HABITS = new Set(HABIT_LIST.map((h) => h.key));
const ATTR_ORDER: AttributeType[] = [
  'vitality',
  'strength',
  'discipline',
  'energy',
  'resistance',
];

const DEFAULT_PLAYER: PlayerRow = {
  level: 1,
  xp_total: 0,
  current_season_key: FIRST_SEASON.key,
  active_habits: [],
  beer_price: DEFAULT_BEER_PRICE,
  beers_per_day: DEFAULT_BEERS_PER_DAY,
};

function resolveActiveHabits(player: PlayerRow, season: SeasonDef): HabitKey[] {
  const chosen = (player.active_habits ?? []).filter((h) =>
    VALID_HABITS.has(h as HabitKey),
  ) as HabitKey[];
  return chosen.length > 0 ? chosen : season.habits;
}

function buildEventContext(
  dayDate: string,
  hadRelapseYesterday: boolean,
  activeHabits: HabitKey[],
  currentStreak: number,
): DailyEventContext {
  return { isWeekend: isWeekendISO(dayDate), hadRelapseYesterday, activeHabits, currentStreak };
}

/** Slots equipados → rareza (para pintar el equipamiento sobre el avatar). */
async function buildEquippedSlots(userId: string): Promise<EquippedSlots> {
  const rows = await getEquipmentRows(userId);
  const map: EquippedSlots = {};
  for (const r of rows) {
    if (!r.equipped_slot) continue;
    const def = EQUIPMENT_BY_KEY[r.item_key];
    if (def) map[r.equipped_slot] = { key: def.key, rarity: def.rarity };
  }
  return map;
}

/** Estado del día para la Home (con bootstrap del jugador si es su primera vez). */
export async function handleGetTodayState(
  userId: string,
  dayDate: string,
): Promise<TodayState> {
  await ensureGameRows(userId, FIRST_SEASON);
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;
  const season = getSeason(player.current_season_key) ?? FIRST_SEASON;
  await ensureGameRows(userId, season);

  const activeHabits = resolveActiveHabits(player, season);

  const [
    claimedArr, streakRow, enemyRow, seasonProg, petRow, relapsedToday, hadRelapseYesterday,
    equipped, expRow, inventory, campStructures, attrMapToday,
  ] = await Promise.all([
    getClaimedHabitKeys(userId, dayDate),
    getStreakRow(userId),
    getEnemyRow(userId, season.key),
    getSeasonProgressRow(userId, season.key),
    getPetRow(userId),
    hasRelapseOn(userId, dayDate),
    hasRelapseOn(userId, addDaysISO(dayDate, -1)),
    buildEquippedSlots(userId),
    getExpedition(userId),
    getInventory(userId),
    getCampStructures(userId),
    getAttributesMap(userId),
  ]);
  const claimed = new Set(claimedArr);

  const expeditionReady =
    !!expRow?.active && !!expRow.ready_at && new Date() >= new Date(expRow.ready_at);
  const builtSet = new Set(campStructures);
  const nextStruct = nextStructure(builtSet);

  const ctx = buildEventContext(dayDate, hadRelapseYesterday, activeHabits, streakRow?.current ?? 0);
  const event = selectDailyEvent(`${userId}:${dayDate}`, ctx);
  const levelInfo = levelFromTotalXp(player.xp_total);
  const missions = generateDailyMissions(season, activeHabits, `${userId}:${dayDate}`);

  const toView = (m: { habit: HabitKey; kind: 'main' | 'secondary'; xp: number }): MissionView => ({
    habit: m.habit,
    kind: m.kind,
    xp: m.xp,
    claimed: claimed.has(m.habit),
  });

  const daysCompleted = seasonProg?.days_completed ?? 0;
  const currentDay = Math.min(daysCompleted + 1, season.durationDays);
  const lastActive = streakRow?.last_active_day ?? null;
  const daysSinceActive = lastActive ? daysBetweenISO(lastActive, dayDate) : 99;

  const hpMax = enemyRow?.hp_max ?? season.enemy.hpMax;
  const hpCurrent = enemyRow?.hp_current ?? hpMax;
  const careDays = petRow?.care_days ?? 0;

  return {
    onboarded: (player.active_habits?.length ?? 0) > 0,
    relapsedToday,
    player: {
      level: levelInfo.level,
      xpTotal: player.xp_total,
      xpIntoLevel: levelInfo.xpIntoLevel,
      xpForNext: levelInfo.xpForNext,
      tier: levelInfo.tier,
      streak: streakRow?.current ?? 0,
    },
    season: {
      key: season.key,
      nameKey: season.nameKey,
      daysCompleted,
      durationDays: season.durationDays,
      zoneKey: zoneForDay(season, currentDay).key,
      completed: !!seasonProg?.completed_at || daysCompleted >= season.durationDays,
      victorySeen: !!seasonProg?.victory_seen_at,
    },
    enemy: { hpCurrent, hpMax, pct: hpMax > 0 ? hpCurrent / hpMax : 0 },
    event: {
      key: event.key,
      multiplier: event.multiplier,
      targetKind: event.target.kind,
      targetHabit: event.target.kind === 'habit' ? event.target.habit : undefined,
    },
    missions: { main: toView(missions.main), secondary: missions.secondary.map(toView) },
    pet: {
      stage: (petRow?.stage as PetStage) ?? petStageForCareDays(careDays),
      mood: petMood(daysSinceActive) as PetMood,
      careDays,
      shields: petRow?.shields ?? 0,
      maxShields: maxShieldsForStage((petRow?.stage as PetStage) ?? petStageForCareDays(careDays)),
    },
    equipped,
    expedition: {
      active: !!expRow?.active,
      ready: expeditionReady,
      departedAt: expRow?.departed_at ?? null,
      readyAt: expRow?.ready_at ?? null,
    },
    materials: inventory,
    camp: {
      built: campStructures,
      next: nextStruct ? { key: nextStruct.key, cost: nextStruct.cost as Record<string, number> } : null,
      canBuildNext: nextStruct ? canAfford(nextStruct.cost, inventory) : false,
    },
    avatarConfig: (player.avatar_config as AvatarConfig | null) ?? {},
    dominantAttr: (() => {
      const dom = dominantAttribute(attrMapToday);
      if (!dom) return null;
      return { key: dom.key, rank: attributeRank(dom.points) };
    })(),
  };
}

/** Guarda los objetivos elegidos en el onboarding. */
export async function handleSaveActiveHabits(
  userId: string,
  input: SaveActiveHabitsInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = saveActiveHabitsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  await ensureGameRows(userId, FIRST_SEASON);
  // Dedup preservando orden
  const habits = [...new Set(parsed.data.habits)];
  await saveActiveHabits(userId, habits);
  return { success: true };
}

/** Registra una recaída: cura al Saboteador. Sin castigo, solo representación. */
export async function handleLogRelapse(
  userId: string,
  dayDate: string,
): Promise<RelapseResult> {
  await ensureGameRows(userId, FIRST_SEASON);
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;
  const season = getSeason(player.current_season_key) ?? FIRST_SEASON;
  await ensureGameRows(userId, season);

  const enemyRow = await getEnemyRow(userId, season.key);
  let enemy = {
    hpCurrent: enemyRow?.hp_current ?? season.enemy.hpMax,
    hpMax: enemyRow?.hp_max ?? season.enemy.hpMax,
  };

  if (await hasRelapseOn(userId, dayDate)) {
    return { success: true, alreadyLogged: true, enemy };
  }

  await insertHabitLog(userId, RELAPSE_KEY, dayDate, 1, 0);
  enemy = applySetback(enemy, season.enemy);
  await updateEnemyHp(userId, season.key, enemy.hpCurrent);
  return { success: true, enemy };
}

/** Datos de la pantalla "Yo": atributos, logros y equipamiento. */
export async function handleGetProfile(userId: string): Promise<ProfileView> {
  await ensureGameRows(userId, FIRST_SEASON);
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;
  const levelInfo = levelFromTotalXp(player.xp_total);

  const [attrMap, achievements, equipmentRows, streakForProfile] = await Promise.all([
    getAttributesMap(userId),
    getUnlockedAchievementKeys(userId),
    getEquipmentRows(userId),
    getStreakRow(userId),
  ]);
  const achievementStats = await getAchievementStats(
    userId,
    levelInfo.level,
    streakForProfile?.longest ?? 0,
  );
  const unlocked = new Set(achievements);
  const equippedByItem = new Map(equipmentRows.map((r) => [r.item_key, r.equipped_slot]));
  const ownedKeys = new Set(equipmentRows.map((r) => r.item_key));
  const isUnlocked = (e: (typeof EQUIPMENT)[number]) =>
    ownedKeys.has(e.key) || (e.unlockedBy !== '' && unlocked.has(e.unlockedBy));

  const equipped: EquippedSlots = {};
  for (const e of EQUIPMENT) {
    if (equippedByItem.get(e.key)) equipped[e.slot] = { key: e.key, rarity: e.rarity };
  }

  const totalAttr = Object.values(attrMap).reduce((a, b) => a + b, 0);
  const equippedBonus = Object.values(equipped).reduce(
    (sum, it) => sum + (it ? (RARITY[it.rarity].order + 1) * 8 : 0),
    0,
  );
  const power = levelInfo.level * 10 + totalAttr + equippedBonus;

  const earnedTitles = evaluateTitles(achievementStats);

  return {
    level: levelInfo.level,
    tier: tierForLevel(levelInfo.level),
    xpTotal: player.xp_total,
    power,
    attributes: ATTR_ORDER.map((type) => {
      const points = attrMap[type] ?? 0;
      return { type, points, rank: attributeRank(points), progress: attributeRankProgress(points) };
    }),
    achievements,
    achievementStats,
    earnedTitles,
    equipment: EQUIPMENT.map((e) => ({
      key: e.key,
      slot: e.slot,
      rarity: e.rarity,
      source: (e.source ?? 'chest') as 'achievement' | 'chest',
      unlockKey: e.unlockKey,
      unlocked: isUnlocked(e),
      equipped: equippedByItem.get(e.key) != null,
    })),
    equipped,
    avatarConfig: (player.avatar_config as AvatarConfig | null) ?? {},
  };
}

/** Equipa un título de héroe (o lo desequipa si es el activo). */
export async function handleSetActiveTitle(
  userId: string,
  titleKey: string | null,
): Promise<{ success: boolean; error?: string }> {
  const player = await getPlayerRow(userId);
  const current = ((player?.avatar_config as AvatarConfig | null) ?? {});
  await updateAvatarConfig(userId, { ...current, activeTitle: titleKey ?? undefined });
  return { success: true };
}

/** Guarda la configuración visual del avatar (tono de piel + color de pelo). */
export async function handleUpdateAvatarConfig(
  userId: string,
  config: AvatarConfig,
): Promise<{ success: boolean }> {
  await updateAvatarConfig(userId, config);
  return { success: true };
}

/** Equipa o desequipa (toggle) un objeto cosmético desbloqueado. */
export async function handleEquipItem(
  userId: string,
  itemKey: string,
): Promise<{ success: boolean; error?: string }> {
  const def = EQUIPMENT_BY_KEY[itemKey];
  if (!def) return { success: false, error: 'unknown item' };
  await ensureGameRows(userId, FIRST_SEASON);

  const unlocked = new Set(await getUnlockedAchievementKeys(userId));
  const rows = await getEquipmentRows(userId);
  const owned = rows.some((r) => r.item_key === itemKey);
  if (!owned && !(def.unlockedBy !== '' && unlocked.has(def.unlockedBy))) {
    return { success: false, error: 'locked' };
  }

  const current = rows.find((r) => r.item_key === itemKey);
  if (current?.equipped_slot) {
    await upsertEquipped(userId, itemKey, null); // toggle off
  } else {
    await clearEquippedSlot(userId, def.slot); // un solo item por slot
    await upsertEquipped(userId, itemKey, def.slot);
  }
  return { success: true };
}

/**
 * Abre un cofre del mapa y otorga su loot COSMÉTICO (nunca XP).
 * Idempotente: si ya lo tienes, no duplica. Solo cofres ya alcanzados.
 */
export async function handleOpenChest(
  userId: string,
  day: number,
): Promise<ChestRewardResult> {
  await ensureGameRows(userId, FIRST_SEASON);
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;
  const season = getSeason(player.current_season_key) ?? FIRST_SEASON;
  await ensureGameRows(userId, season);

  const sp = await getSeasonProgressRow(userId, season.key);
  const daysCompleted = sp?.days_completed ?? 0;
  const bossDay = season.durationDays;

  const chestDays = season.zones
    .map((z, i) => (season.zones[i + 1] ? season.zones[i + 1].startDay : bossDay + 1) - 1)
    .filter((d) => d > 0 && d < bossDay);

  const idx = chestDays.indexOf(day);
  if (idx === -1 || day > daysCompleted) return { success: false };

  // Cada temporada tiene su propio bloque en CHEST_LOOT. S1=0, S2=7, S3=13.
  const CHEST_OFFSET: Record<string, number> = { 's1-reset': 0, 's2-strength': 7, 's3-cut': 13, 's4-discipline': 19 };
  const item = CHEST_LOOT[(CHEST_OFFSET[season.key] ?? 0) + idx];
  if (!item) return { success: false };

  const rows = await getEquipmentRows(userId);
  const already = rows.some((r) => r.item_key === item.key);
  if (!already) await upsertEquipped(userId, item.key, null); // desbloquea (poseído, sin equipar)

  return { success: true, itemKey: item.key, rarity: item.rarity, slot: item.slot, newlyUnlocked: !already };
}

/** Marca la cinemática de victoria como vista (ligada a la cuenta). */
export async function handleMarkVictorySeen(
  userId: string,
  seasonKey: string,
): Promise<{ success: boolean }> {
  await markVictorySeen(userId, seasonKey);
  return { success: true };
}

/** Reclama el botín de la expedición (materiales, NUNCA XP). */
export async function handleClaimExpedition(
  userId: string,
  dayDate: string,
): Promise<ClaimExpeditionResult> {
  const exp = await getExpedition(userId);
  if (!exp?.active || !exp.ready_at || new Date() < new Date(exp.ready_at)) {
    return { success: false };
  }
  const reward = computeExpeditionReward(`${userId}:${dayDate}`);
  await addMaterials(userId, { wood: reward.wood, stone: reward.stone });

  // Posible descubrimiento (coleccionable de enciclopedia, no XP).
  const found = new Set(await getDiscoveries(userId));
  const discovery = computeExpeditionDiscovery(`${userId}:${dayDate}`, found);
  if (discovery) await addDiscovery(userId, discovery.key);

  await finishExpedition(userId);
  return { success: true, reward, discoveryKey: discovery?.key };
}

/** Enciclopedia: claves de descubrimientos encontrados. */
export async function handleGetEncyclopedia(
  userId: string,
): Promise<{ found: string[]; built: string[] }> {
  const [found, built] = await Promise.all([
    getDiscoveries(userId),
    getCampStructures(userId),
  ]);
  return { found, built };
}

/** Construye la siguiente estructura del campamento (gastando materiales). */
export async function handleBuildStructure(
  userId: string,
  structureKey: string,
): Promise<BuildResult> {
  const def = CAMP_STRUCTURES_BY_KEY[structureKey];
  if (!def) return { success: false, error: 'unknown' };

  const [built, inventory] = await Promise.all([
    getCampStructures(userId),
    getInventory(userId),
  ]);
  const next = nextStructure(new Set(built));
  if (!next || next.key !== structureKey) return { success: false, error: 'not_next' };
  if (!canAfford(next.cost, inventory)) return { success: false, error: 'insufficient' };

  const deltas: Record<string, number> = {};
  for (const [k, v] of Object.entries(next.cost)) deltas[k] = -(v ?? 0);
  await addMaterials(userId, deltas);
  await buildStructure(userId, structureKey);
  return { success: true, builtKey: structureKey };
}

/** Monday (UTC) de una fecha ISO dada. */
function weekStartISO(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const dow = d.getUTCDay(); // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().substring(0, 10);
}

/** Estadísticas visuales (pantalla Stats). */
export async function handleGetStats(
  userId: string,
  dayDate: string,
): Promise<StatsView> {
  await ensureGameRows(userId, FIRST_SEASON);
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;

  const [streak, attributesMap] = await Promise.all([
    getStreakRow(userId),
    getAttributesMap(userId),
  ]);

  const levelInfo = levelFromTotalXp(player.xp_total);
  const achievementStats = await getAchievementStats(userId, levelInfo.level, streak?.longest ?? 0);

  const beerPrice = player.beer_price ?? DEFAULT_BEER_PRICE;
  const beersPerDay = player.beers_per_day ?? DEFAULT_BEERS_PER_DAY;

  // Logs enriquecidos: últimas 8 semanas (56 días)
  const since56 = addDaysISO(dayDate, -55);
  const rawLogs = await getRecentHabitXpLogs(userId, since56);
  const realLogs = rawLogs.filter((r) => !r.habit_key.startsWith('__'));

  // Actividad: hábitos cumplidos por día, últimas 8 semanas (56 días)
  const counts = new Map<string, number>();
  const xpPerDay = new Map<string, number>();
  for (const r of realLogs) {
    counts.set(r.day_date, (counts.get(r.day_date) ?? 0) + 1);
    xpPerDay.set(r.day_date, (xpPerDay.get(r.day_date) ?? 0) + r.xp_awarded);
  }
  const activity: { date: string; count: number }[] = [];
  for (let i = 55; i >= 0; i--) {
    const d = addDaysISO(dayDate, -i);
    activity.push({ date: d, count: counts.get(d) ?? 0 });
  }

  // XP por día: últimos 14 días (oldest first)
  const xpByDay: { date: string; xp: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDaysISO(dayDate, -i);
    xpByDay.push({ date: d, xp: xpPerDay.get(d) ?? 0 });
  }

  // XP por semana: últimas 8 semanas (oldest first)
  const currentWeekStart = weekStartISO(dayDate);
  const xpByWeekMap = new Map<string, number>();
  for (const r of realLogs) {
    const wk = weekStartISO(r.day_date);
    xpByWeekMap.set(wk, (xpByWeekMap.get(wk) ?? 0) + r.xp_awarded);
  }
  const xpByWeek: { weekStart: string; xp: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const wkStart = addDaysISO(currentWeekStart, -i * 7);
    xpByWeek.push({ weekStart: wkStart, xp: xpByWeekMap.get(wkStart) ?? 0 });
  }

  // Comparativa mensual
  const thisMonth = dayDate.substring(0, 7);
  const [yearStr, monthStr] = thisMonth.split('-');
  const yr = parseInt(yearStr), mo = parseInt(monthStr);
  const prevMonth = `${mo === 1 ? yr - 1 : yr}-${String(mo === 1 ? 12 : mo - 1).padStart(2, '0')}`;
  const monthHabits = realLogs.filter((r) => r.day_date.substring(0, 7) === thisMonth).length;
  const prevMonthHabits = realLogs.filter((r) => r.day_date.substring(0, 7) === prevMonth).length;

  // Ranking de hábitos: últimos 90 días (excluye MC_BONUS_KEY)
  const cutoff90 = addDaysISO(dayDate, -90);
  const logs90 = realLogs.filter((r) => r.day_date >= cutoff90 && r.habit_key !== 'mission_complete');
  const habitCounts = new Map<string, number>();
  for (const r of logs90) {
    habitCounts.set(r.habit_key, (habitCounts.get(r.habit_key) ?? 0) + 1);
  }
  const habitRanking = [...habitCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([habitKey, count]) => ({ habitKey, count }));

  // Día de semana más activo: últimos 90 días
  const dowCounts = new Array(7).fill(0) as number[];
  for (const r of logs90) {
    const dow = new Date(`${r.day_date}T12:00:00Z`).getUTCDay();
    dowCounts[dow]++;
  }
  const dayOfWeek = dowCounts.map((count, day) => ({ day, count }));

  return {
    level: levelInfo.level,
    xpTotal: player.xp_total,
    currentStreak: streak?.current ?? 0,
    longestStreak: streak?.longest ?? 0,
    daysAlcoholFree: achievementStats.alcoholFreeDays,
    moneySaved: Math.round(achievementStats.alcoholFreeDays * beersPerDay * beerPrice),
    trainings: achievementStats.trainings,
    kmWalked: Math.round(achievementStats.kmWalked * 10) / 10,
    reads: achievementStats.reads,
    seasonsCompleted: achievementStats.seasonsCompleted,
    activity,
    attributes: attributesMap,
    xpByWeek,
    xpByDay,
    monthHabits,
    prevMonthHabits,
    habitRanking,
    dayOfWeek,
  };
}

/** Ajustes de economía actuales del usuario. */
export async function handleGetEconomy(userId: string): Promise<EconomySettings> {
  await ensureGameRows(userId, FIRST_SEASON);
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;
  return {
    beerPrice: player.beer_price ?? DEFAULT_BEER_PRICE,
    beersPerDay: player.beers_per_day ?? DEFAULT_BEERS_PER_DAY,
  };
}

/** Guarda los ajustes de economía (precio cerveza + cervezas/día). */
export async function handleSaveEconomy(
  userId: string,
  input: SaveEconomyInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = saveEconomySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }
  await ensureGameRows(userId, FIRST_SEASON);
  await saveEconomySettings(userId, parsed.data.beerPrice, parsed.data.beersPerDay);
  return { success: true };
}

/** Exporta todos los datos del usuario (control de datos). */
export async function handleExportData(userId: string): Promise<Record<string, unknown[]>> {
  return getAllGameData(userId);
}

/** Borra todos los datos de juego del usuario (reinicio total). */
export async function handleDeleteData(userId: string): Promise<{ success: boolean }> {
  await deleteAllGameData(userId);
  return { success: true };
}

export async function handleAdvanceSeason(
  userId: string,
): Promise<{ success: boolean; nextSeasonKey: string | null }> {
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;
  const currentSeason = getSeason(player.current_season_key);
  const nextSeason =
    SEASONS.filter((s) => (currentSeason ? s.order > currentSeason.order : false)).sort(
      (a, b) => a.order - b.order,
    )[0] ?? null;
  if (!nextSeason) return { success: false, nextSeasonKey: null };
  await advanceToNextSeason(userId, nextSeason);
  return { success: true, nextSeasonKey: nextSeason.key };
}

/** Reclama un hábito: calcula con el motor, persiste idempotente y celebra. */
export async function handleClaimHabit(
  userId: string,
  input: ClaimHabitInput,
): Promise<ClaimResult> {
  const parsed = claimHabitSchema.safeParse(input);
  if (!parsed.success) {
    return emptyResult(false, parsed.error.issues[0]?.message);
  }
  const { habitKey, value, dayDate } = parsed.data;

  await ensureGameRows(userId, FIRST_SEASON);
  const player = (await getPlayerRow(userId)) ?? DEFAULT_PLAYER;
  const season = getSeason(player.current_season_key) ?? FIRST_SEASON;
  await ensureGameRows(userId, season);

  const claimed = new Set(await getClaimedHabitKeys(userId, dayDate));
  const enemyRow = await getEnemyRow(userId, season.key);
  const streakRow = (await getStreakRow(userId)) ?? {
    current: 0,
    longest: 0,
    last_active_day: null as string | null,
  };

  const levelBefore = levelFromTotalXp(player.xp_total);
  const enemyNow = {
    hpCurrent: enemyRow?.hp_current ?? season.enemy.hpMax,
    hpMax: enemyRow?.hp_max ?? season.enemy.hpMax,
  };

  // Idempotencia: ya reclamado hoy → no-op
  if (claimed.has(habitKey)) {
    return {
      ...emptyResult(true),
      alreadyClaimed: true,
      levelBefore: levelBefore.level,
      levelAfter: levelBefore.level,
      enemy: enemyNow,
      player: { level: levelBefore.level, xpTotal: player.xp_total, streak: streakRow.current },
    };
  }

  // Cálculo (motor puro)
  const activeHabits = resolveActiveHabits(player, season);
  const hadRelapseYesterday = await hasRelapseOn(userId, addDaysISO(dayDate, -1));
  const ctx = buildEventContext(dayDate, hadRelapseYesterday, activeHabits, streakRow.current);
  const event = selectDailyEvent(`${userId}:${dayDate}`, ctx);
  const habit = getHabit(habitKey);
  const baseXp = calculateHabitXp(habit, value);
  const smult = streakMultiplier(streakRow.current);

  // Bonus de atributo: el rango del atributo relevante da un % extra de XP
  const attrMap = await getAttributesMap(userId);
  const attrPoints = attrMap[habit.attribute] ?? 0;
  const attrRank = attributeRank(attrPoints); // 0-based rank integer
  const attrBonusMultiplier = 1 + attrRank * 0.08; // rank 1 = +8%, rank 2 = +16%, rank 3 = +24%...

  const baseXpWithMults = Math.round(applyMultipliers(baseXp, {
    event: eventMultiplierForHabit(event, habitKey),
    streak: smult,
  }));
  const xpAwarded = Math.round(baseXpWithMults * attrBonusMultiplier);
  const attrBonusXp = xpAwarded - baseXpWithMults;

  const missions = generateDailyMissions(season, activeHabits, `${userId}:${dayDate}`);
  const missionComplete =
    allMissionsComplete(missions, new Set([...claimed, habitKey])) &&
    !claimed.has(MC_BONUS_KEY);
  const bonusXp = missionComplete ? MISSION_COMPLETE_BONUS : 0;

  const xpTotal = player.xp_total + xpAwarded + bonusXp;
  const levelAfter = levelFromTotalXp(xpTotal);

  // Persistencia (idempotente por el UNIQUE de habit_logs)
  const inserted = await insertHabitLog(userId, habitKey, dayDate, value, xpAwarded);
  if (!inserted) {
    return {
      ...emptyResult(true),
      alreadyClaimed: true,
      levelBefore: levelBefore.level,
      levelAfter: levelBefore.level,
      enemy: enemyNow,
      player: { level: levelBefore.level, xpTotal: player.xp_total, streak: streakRow.current },
    };
  }
  if (missionComplete) {
    await insertHabitLog(userId, MC_BONUS_KEY, dayDate, 1, bonusXp);
  }
  await updatePlayerXp(userId, xpTotal, levelAfter.level);
  await incrementAttribute(userId, habit.attribute, attributePointsForHabit(habit));
  // Cada hábito cumplido da materiales para construir el campamento (no XP).
  await addMaterials(userId, { wood: MATERIAL_PER_HABIT });

  // Enemigo — el hábito principal inflige el daño mayor; el resto daño secundario
  let enemyState = enemyNow;
  const enemyMultiplier = eventEnemyMultiplier(event);
  if (habitKey === season.mainHabit) {
    enemyState = applyDayCompleted(enemyState, season.enemy, enemyMultiplier);
  } else {
    const baseDamage = Math.round(habit.enemyDamage * enemyMultiplier);
    enemyState = applyHabitDamage(enemyState, baseDamage);
  }
  const enemyDamageDealt = enemyNow.hpCurrent - enemyState.hpCurrent;
  await updateEnemyHp(userId, season.key, enemyState.hpCurrent);

  // Misión principal → racha + temporada + mascota (primera vez hoy)
  let streakNow = streakRow.current;
  let longest = streakRow.longest;
  let streakSaved = false;
  if (habitKey === missions.main.habit) {
    // Cumplir la misión principal manda al héroe de EXPEDICIÓN (si no hay una activa).
    const exp = await getExpedition(userId);
    if (!exp?.active) {
      const departed = new Date();
      const ready = new Date(departed.getTime() + EXPEDITION_HOURS * 3_600_000);
      await startExpedition(userId, departed.toISOString(), ready.toISOString());
    }

    const daysSince = streakRow.last_active_day
      ? daysBetweenISO(streakRow.last_active_day, dayDate)
      : 99;
    if (daysSince !== 0) {
      const petRow = await getPetRow(userId);
      const careDays = (petRow?.care_days ?? 0) + 1;
      const stage = petStageForCareDays(careDays);
      let shields = petRow?.shields ?? 0;
      // La mascota gana un escudo cada N días de cuidado (hasta su máximo).
      if (careDays % SHIELD_EARN_EVERY === 0 && shields < maxShieldsForStage(stage)) {
        shields += 1;
      }

      // Si hubo un hueco, la mascota gasta escudos para SALVAR la racha.
      const missed = Math.max(0, daysSince - 1);
      if (missed > 0 && shields >= missed) {
        shields -= missed;
        streakNow = streakRow.current + 1; // racha preservada
        streakSaved = true;
      } else {
        streakNow = nextStreak(streakRow.current, daysSince);
      }
      longest = Math.max(streakRow.longest, streakNow);
      await updateStreak(userId, streakNow, longest, dayDate);

      const sp = await getSeasonProgressRow(userId, season.key);
      const advanced = advanceSeasonDay(
        {
          seasonKey: season.key,
          daysCompleted: sp?.days_completed ?? 0,
          completed: !!sp?.completed_at,
        },
        season,
      );
      await updateSeasonProgress(userId, season.key, advanced.daysCompleted, advanced.completed);

      await updatePet(userId, stage, careDays, petMood(0), shields);
    }
  }

  // Logros + Títulos
  let newAchievements: string[] = [];
  let newTitles: string[] = [];
  try {
    const stats = await getAchievementStats(userId, levelAfter.level, longest);
    const unlocked = new Set(await getUnlockedAchievementKeys(userId));
    newAchievements = evaluateAchievements(stats, unlocked);
    await unlockAchievements(userId, newAchievements);

    // Títulos — evaluar contra stats actualizados
    const prevTitleKeys = evaluateTitles(
      await getAchievementStats(userId, levelBefore.level, streakRow.longest),
    );
    const currTitleKeys = evaluateTitles(stats);
    const prevSet = new Set(prevTitleKeys);
    newTitles = currTitleKeys.filter((t) => !prevSet.has(t));
  } catch {
    /* logros/títulos no son críticos para el claim */
  }

  const STREAK_MILESTONES = [7, 21, 30, 50, 100, 365];
  const streakMilestone = STREAK_MILESTONES.find(
    (m) => streakRow.current < m && streakNow >= m,
  );

  return {
    success: true,
    xpAwarded,
    bonusXp,
    missionComplete,
    levelBefore: levelBefore.level,
    levelAfter: levelAfter.level,
    leveledUp: levelAfter.level > levelBefore.level,
    tierChanged: levelAfter.tier !== levelBefore.tier,
    streakSaved,
    streakMilestone,
    streakMultiplier: smult,
    attrBonusXp,
    enemyDamageDealt,
    newTitles,
    enemy: enemyState,
    newAchievements,
    player: { level: levelAfter.level, xpTotal, streak: streakNow },
  };
}

/** Canjea materiales por un item cosmético en la fragua. NUNCA da XP. */
export async function handleCraftItem(
  userId: string,
  itemKey: string,
): Promise<{ success: boolean; error?: string }> {
  const craftable = CRAFTABLE_BY_KEY[itemKey];
  if (!craftable) return { success: false, error: 'unknown_item' };

  const [inventory, owned] = await Promise.all([
    getInventory(userId),
    getEquipmentRows(userId),
  ]);

  if (owned.some((r) => r.item_key === itemKey)) {
    return { success: false, error: 'already_owned' };
  }

  if (!canAfford(craftable.cost, inventory)) {
    return { success: false, error: 'insufficient' };
  }

  // Deducir materiales (deltas negativos).
  const deltas = Object.fromEntries(
    Object.entries(craftable.cost).map(([k, v]) => [k, -v]),
  );
  await addMaterials(userId, deltas);

  // Desbloquear el item (sin equipar).
  await upsertEquipped(userId, itemKey, null);

  return { success: true };
}

function emptyResult(success: boolean, error?: string): ClaimResult {
  return {
    success,
    error,
    xpAwarded: 0,
    bonusXp: 0,
    missionComplete: false,
    levelBefore: 1,
    levelAfter: 1,
    leveledUp: false,
    tierChanged: false,
    streakMultiplier: 1,
    attrBonusXp: 0,
    enemyDamageDealt: 0,
    newTitles: [],
    enemy: { hpCurrent: 0, hpMax: 0 },
    newAchievements: [],
    player: { level: 1, xpTotal: 0, streak: 0 },
  };
}
