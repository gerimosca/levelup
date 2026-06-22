import { z } from 'zod';
import type {
  HabitKey,
  LevelInfo,
  PetActivity,
  PetMood,
  PetStage,
  RarityKey,
  ExpeditionReward,
} from '@/game-core';

/** Estado de la expedición del héroe. */
export interface ExpeditionView {
  active: boolean;
  ready: boolean;
  departedAt: string | null;
  readyAt: string | null;
}

/** Estado del campamento para la Home. */
export interface CampView {
  built: string[];
  next: { key: string; cost: Record<string, number> } | null;
  canBuildNext: boolean;
}

export interface ClaimExpeditionResult {
  success: boolean;
  reward?: ExpeditionReward;
  /** Descubrimiento encontrado en esta expedición (si lo hubo). */
  discoveryKey?: string;
}

export interface BuildResult {
  success: boolean;
  error?: string;
  builtKey?: string;
}

/** Objeto equipado en un slot (clave + rareza, para pintar el avatar). */
export interface EquippedItem {
  key: string;
  rarity: RarityKey;
}
/** Mapa de slots equipados → objeto (para pintar el avatar). */
export type EquippedSlots = Partial<Record<string, EquippedItem>>;

// ── Personalización visual del avatar ──────────────────────────────────────

export const SKIN_TONES = {
  ivory:  '#FDE8CD',
  light:  '#F0C49B',
  medium: '#D4956A',
  tan:    '#B07850',
  dark:   '#7A4A2E',
  ebony:  '#4A2810',
} as const;

export const HAIR_COLORS = {
  brown:  '#5A3E2B',
  black:  '#1A1A1A',
  blonde: '#C8A44C',
  red:    '#8B2500',
  silver: '#C8C8C8',
  white:  '#F0F0F0',
  blue:   '#2266CC',
  violet: '#7755CC',
} as const;

export type SkinKey = keyof typeof SKIN_TONES;
export type HairKey = keyof typeof HAIR_COLORS;

export type AvatarExpression = 'idle' | 'happy' | 'angry';

export interface AvatarConfig {
  skinKey?: SkinKey;
  hairKey?: HairKey;
  /** Nombre del héroe (max 20 chars). Si no tiene, se omite. */
  heroName?: string;
  /** Título activo del héroe. */
  activeTitle?: string;
}

// ── Clave sintética para el bonus de "Mission Complete" (idempotencia en habit_logs). ──
export const MC_BONUS_KEY = '__mission_complete_bonus__';
/** Clave sintética para registrar una recaída del día (idempotencia en habit_logs). */
export const RELAPSE_KEY = '__relapse__';

const HABIT_KEYS = [
  'no_alcohol',
  'train',
  'sleep',
  'water',
  'steps',
  'eat_well',
  'read',
  'meditate',
  'no_smoking',
  'no_social_media',
  'no_junk_food',
] as const;

/** Input del onboarding: el usuario elige al menos 3 objetivos. */
export const saveActiveHabitsSchema = z.object({
  habits: z.array(z.enum(HABIT_KEYS)).min(3),
});
export type SaveActiveHabitsInput = z.infer<typeof saveActiveHabitsSchema>;

/** Input validado para reclamar un hábito. */
export const claimHabitSchema = z.object({
  habitKey: z.enum(HABIT_KEYS),
  /** Valor del hábito (litros, horas, pasos...). Boolean = 1. */
  value: z.number().positive().default(1),
  /** Día local del usuario en formato YYYY-MM-DD. */
  dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ClaimHabitInput = z.infer<typeof claimHabitSchema>;

export interface MissionView {
  habit: HabitKey;
  kind: 'main' | 'secondary';
  xp: number;
  claimed: boolean;
}

export interface DailyEventView {
  key: string;
  multiplier: number;
  targetKind: 'habit' | 'all' | 'enemy';
  targetHabit?: HabitKey;
}

/** Estado del día que consume la Home. */
export interface TodayState {
  /** ¿El usuario ya eligió sus objetivos? Si no, la Home muestra el onboarding. */
  onboarded: boolean;
  relapsedToday: boolean;
  player: {
    level: number;
    xpTotal: number;
    xpIntoLevel: number;
    xpForNext: number;
    tier: LevelInfo['tier'];
    streak: number;
  };
  season: {
    key: string;
    nameKey: string;
    daysCompleted: number;
    durationDays: number;
    zoneKey: string;
    completed: boolean;
    victorySeen: boolean;
  };
  enemy: { hpCurrent: number; hpMax: number; pct: number };
  event: DailyEventView;
  missions: { main: MissionView; secondary: MissionView[] };
  pet: { stage: PetStage; mood: PetMood; careDays: number; shields: number; maxShields: number; activity?: PetActivity };
  equipped: EquippedSlots;
  expedition: ExpeditionView;
  materials: Record<string, number>;
  camp: CampView;
  avatarConfig: AvatarConfig;
  /** Atributo dominante del jugador para el aura del héroe (null si no hay puntos aún). */
  dominantAttr: { key: string; rank: number } | null;
}

/** Vista de un atributo para la pantalla "Yo". */
export interface AttributeView {
  type: string;
  points: number;
  rank: number;
  progress: number;
}

/** Vista de una pieza de equipamiento. */
export interface EquipmentView {
  key: string;
  slot: string;
  rarity: RarityKey;
  source: 'achievement' | 'chest' | 'craft';
  unlockKey: string;
  unlocked: boolean;
  equipped: boolean;
}

/** Datos de la pantalla "Yo". */
export interface ProfileView {
  level: number;
  tier: LevelInfo['tier'];
  xpTotal: number;
  /** Poder total: nivel + atributos + equipo (rating de progresión). */
  power: number;
  attributes: AttributeView[];
  achievements: string[];
  achievementStats: import('@/game-core').AchievementStats;
  /** Títulos desbloqueados por el jugador. */
  earnedTitles: string[];
  equipment: EquipmentView[];
  equipped: EquippedSlots;
  avatarConfig: AvatarConfig;
}

/** Resultado de registrar una recaída. */
export interface RelapseResult {
  success: boolean;
  alreadyLogged?: boolean;
  enemy: { hpCurrent: number; hpMax: number };
}

/** Resultado de abrir un cofre (recompensa cosmética, NUNCA XP). */
export interface ChestRewardResult {
  success: boolean;
  itemKey?: string;
  rarity?: RarityKey;
  slot?: string;
  newlyUnlocked?: boolean;
}

/** Estadísticas visuales (pantalla Stats). */
export interface StatsView {
  level: number;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  daysAlcoholFree: number;
  moneySaved: number;
  trainings: number;
  kmWalked: number;
  reads: number;
  seasonsCompleted: number;
  /** Hábitos cumplidos por día, últimas 8 semanas (56 días, oldest first). */
  activity: { date: string; count: number }[];
  /** Puntos de atributo acumulados por tipo (para el radar). */
  attributes: Record<string, number>;
  /** XP ganado por semana, últimas 8 semanas (oldest first). */
  xpByWeek: { weekStart: string; xp: number }[];
  /** XP ganado por día, últimos 14 días (oldest first). */
  xpByDay: { date: string; xp: number }[];
  /** Hábitos reales completados este mes calendario. */
  monthHabits: number;
  /** Hábitos reales completados el mes calendario anterior. */
  prevMonthHabits: number;
  /** Top hábitos por frecuencia de completion (últimos 90 días). */
  habitRanking: { habitKey: string; count: number }[];
  /** Claims por día de semana 0=Dom…6=Sáb (últimos 90 días). */
  dayOfWeek: { day: number; count: number }[];
}

/** Progreso de un miembro en un reto compartido. */
export interface ChallengeMemberView {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  seasonKey: string;
  daysCompleted: number;
  streak: number;
  level: number;
  loggedToday: boolean;
  isMe: boolean;
}

/** Vista de un reto compartido con todos sus miembros. */
export interface ChallengeView {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  isOwner: boolean;
  members: ChallengeMemberView[];
}

/** Ajustes de economía del usuario (dinero ahorrado). */
export interface EconomySettings {
  beerPrice: number;
  beersPerDay: number;
}

export const saveEconomySchema = z.object({
  beerPrice: z.number().min(0).max(1000),
  beersPerDay: z.number().min(0).max(100),
});
export type SaveEconomyInput = z.infer<typeof saveEconomySchema>;

/** Resultado de reclamar un hábito. */
export interface ClaimResult {
  success: boolean;
  error?: string;
  alreadyClaimed?: boolean;
  xpAwarded: number;
  bonusXp: number;
  missionComplete: boolean;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
  tierChanged: boolean;
  /** La mascota gastó un escudo para salvar tu racha. */
  streakSaved?: boolean;
  /** Si la racha cruzó un hito (7, 21, 30, 50, 100, 365), contiene ese número. */
  streakMilestone?: number;
  /** Multiplicador de racha aplicado (e.g. 1.5 = 50% extra). */
  streakMultiplier: number;
  /** XP de bonus por atributo (atributo relevante en rango alto). */
  attrBonusXp: number;
  /** Daño infligido al enemigo en este claim. */
  enemyDamageDealt: number;
  /** Nuevos títulos desbloqueados en este claim. */
  newTitles: string[];
  enemy: { hpCurrent: number; hpMax: number };
  newAchievements: string[];
  player: { level: number; xpTotal: number; streak: number };
}
