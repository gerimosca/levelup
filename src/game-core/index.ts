/**
 * game-core — Motor de juego de LevelUp (TypeScript puro, portable a móvil).
 *
 * Punto de entrada único. La UI (Next.js hoy, Expo mañana) consume desde aquí;
 * nunca calcula reglas de juego por su cuenta.
 *
 * Ver docs/design/04-architecture.md y src/game-core/README.md.
 */

// Tipos
export type {
  AttributeType,
  HabitKey,
  HabitDef,
  GradedConfig,
  CharacterTier,
  LevelInfo,
  XpMultipliers,
  EnemyConfig,
  EnemyState,
  ZoneDef,
  SeasonDef,
  SeasonProgress,
  EventTarget,
  EventDef,
  DailyEventContext,
  Mission,
  DailyMissions,
  PetStage,
  PetMood,
  AchievementStats,
  AchievementDef,
  EquipmentDef,
} from './types';

// Datos / balance
export { HABITS, HABIT_LIST, getHabit } from './data/habits';
export {
  xpToNext,
  cumulativeXpForLevel,
  LEVEL_CURVE_BASE,
  LEVEL_CURVE_EXPONENT,
  MAX_LEVEL,
} from './data/levels';
export { SEASONS, SEASONS_BY_KEY, getSeason, FIRST_SEASON, SEASON_1_RESET, SEASON_2_STRENGTH, SEASON_3_CUT, SEASON_4_DISCIPLINE, SEASON_ROADMAP } from './data/seasons';
export type { SeasonRoadmapEntry } from './data/seasons';
export { EVENTS } from './data/events';
export { ACHIEVEMENTS, ACHIEVEMENTS_BY_KEY } from './data/achievements';
export { EQUIPMENT, EQUIPMENT_BY_KEY, ACHIEVEMENT_EQUIPMENT, CHEST_LOOT, CRAFTABLE_EQUIPMENT } from './data/equipment';
export { CRAFTABLE_ITEMS, CRAFTABLE_BY_KEY } from './data/craftables';
export type { CraftableItemDef } from './data/craftables';
export { RARITY, topRarity } from './data/rarity';
export type { RarityKey, RarityDef } from './data/rarity';
export { DEFAULT_BEER_PRICE, DEFAULT_BEERS_PER_DAY, JOURNAL_XP_BONUS } from './data/economy';
export { MATERIALS, EXPEDITION_HOURS, MATERIAL_PER_HABIT } from './data/world';
export type { MaterialKey } from './data/world';
export {
  CAMP_STRUCTURES,
  CAMP_STRUCTURES_BY_KEY,
  STARTING_STRUCTURE,
  nextStructure,
  canAfford,
} from './data/camp';
export type { CampStructureDef } from './data/camp';
export { computeExpeditionReward } from './data/expedition';
export type { ExpeditionReward, ExpeditionTier } from './data/expedition';
export { NPCS, NPC_BY_STRUCTURE, presentNpcs, pickNpcGreeting } from './data/npcs';
export type { NpcDef } from './data/npcs';
export {
  DISCOVERIES,
  DISCOVERIES_BY_KEY,
  DISCOVERY_CATEGORIES,
  computeExpeditionDiscovery,
} from './data/discoveries';
export type { DiscoveryDef, DiscoveryCategory } from './data/discoveries';
export { STORY_CHAPTERS, unlockedChapters, chapterForStructure } from './data/story';
export type { StoryChapter } from './data/story';

// XP
export { calculateHabitXp, applyMultipliers, calculateReward } from './xp/calculateXp';
export { applyDailyDecay, penaltyForHabit, MISS_PENALTY_RATIO } from './xp/penalty';
export type { DecayResult } from './xp/penalty';

// Niveles
export { levelFromTotalXp, tierForLevel } from './leveling/leveling';

// Racha
export { streakMultiplier, nextStreak } from './streak/streak';

// Atributos
export {
  attributePointsForHabit,
  attributeRank,
  attributeRankProgress,
  dominantAttribute,
  ATTRIBUTE_RANK_SIZE,
} from './attributes/attributes';

// Enemigo (antagonista de temporada)
export {
  createEnemy,
  applyDayCompleted,
  applyHabitDamage,
  applySetback,
  enemyHpPct,
  isEnemyDefeated,
} from './enemy/enemy';

// Títulos de héroe
export { TITLES, TITLES_BY_KEY, evaluateTitles } from './data/titles';
export type { TitleDef } from './data/titles';

// Mascota
export {
  petStageForCareDays,
  petMood,
  isReunion,
  nextPetStageInfo,
  maxShieldsForStage,
  SHIELD_EARN_EVERY,
} from './pet/pet';

// Temporada y mapa
export {
  createSeasonProgress,
  zoneForDay,
  advanceSeasonDay,
  seasonProgressPct,
} from './season/season';

// Eventos diarios
export {
  selectDailyEvent,
  eligibleEvents,
  eventMultiplierForHabit,
  eventEnemyMultiplier,
} from './events/events';

// Misiones
export {
  generateDailyMissions,
  allMissionsComplete,
  MISSION_COMPLETE_BONUS,
  ROTATING_MISSIONS_PER_DAY,
} from './missions/missions';

// Logros
export { evaluateAchievements } from './achievements/achievements';

// Actividades de la mascota (mundo vivo)
export { PET_ACTIVITY_EMOJI, PET_THOUGHTS, petActivityForHour } from './data/pet-activities';
export type { PetActivity } from './data/pet-activities';

// Utilidades deterministas
export { seededUnit, pickWeighted } from './lib/seeded-random';
