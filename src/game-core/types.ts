/**
 * game-core/types — Tipos del motor de juego.
 *
 * REGLA DE PUREZA: este paquete es TypeScript puro. No importa React, Next ni
 * Supabase. Es determinista y testeable, y por eso será reutilizable tal cual en
 * la futura app móvil (Expo). Ver docs/design/04-architecture.md.
 */

import type { RarityKey } from './data/rarity';

/** Atributos del personaje (ver docs/design/02-game-design.md §4). */
export type AttributeType =
  | 'vitality' // Vitalidad
  | 'strength' // Fuerza
  | 'discipline' // Disciplina
  | 'energy' // Energía
  | 'resistance'; // Resistencia

/** Hábitos soportados en el MVP. */
export type HabitKey =
  | 'no_alcohol'
  | 'train'
  | 'sleep'
  | 'water'
  | 'steps'
  | 'eat_well'
  | 'read'
  | 'meditate'
  | 'no_smoking'
  | 'no_social_media'
  | 'no_junk_food';

/** Configuración de un hábito gradual (XP parcial). */
export interface GradedConfig {
  /** Valor mínimo por debajo del cual no se otorga XP (default 0). */
  min?: number;
  /** Valor que otorga el XP base completo. */
  target: number;
  /** Granularidad de los tramos de XP parcial. */
  step: number;
  /** Bonus opcional por superar un umbral (p.ej. >15.000 pasos). */
  bonus?: { threshold: number; xp: number };
}

/** Definición declarativa de un hábito. Vive en data/, rebalanceable. */
export interface HabitDef {
  key: HabitKey;
  /** XP base por completarlo del todo. */
  baseXp: number;
  /** Atributo principal que mejora. */
  attribute: AttributeType;
  /** 'boolean' = hecho/no hecho · 'graded' = XP proporcional al valor. */
  type: 'boolean' | 'graded';
  /** Configuración para hábitos graduales. */
  graded?: GradedConfig;
  /** Daño base al enemigo por reclamar este hábito (0 = no daña). */
  enemyDamage: number;
}

/** Tier visual del personaje según nivel (ver §5 del game design). */
export type CharacterTier =
  | 'initiate' // 1-4
  | 'apprentice' // 5-9
  | 'warrior' // 10-19
  | 'veteran' // 20-34
  | 'hero' // 35-49
  | 'legend'; // 50+

/** Resultado de resolver el nivel a partir del XP total. */
export interface LevelInfo {
  /** Nivel actual (>= 1). */
  level: number;
  /** XP acumulada dentro del nivel actual. */
  xpIntoLevel: number;
  /** XP necesaria para pasar al siguiente nivel. */
  xpForNext: number;
  /** Progreso dentro del nivel actual, 0..1. */
  progress: number;
  /** Tier visual correspondiente. */
  tier: CharacterTier;
}

/** Multiplicadores aplicables al XP de una acción. */
export interface XpMultipliers {
  /** Multiplicador del evento diario sobre la acción concreta (default 1). */
  event?: number;
  /** Multiplicador global por racha (default 1). */
  streak?: number;
}

// ===========================================================================
// Temporadas, enemigo y mapa (ver docs/design/02-game-design.md §7, §11, §12)
// ===========================================================================

/** Configuración del antagonista de una temporada. */
export interface EnemyConfig {
  key: string;
  /** Clave de copy para el nombre narrativo. */
  nameKey: string;
  hpMax: number;
  /** Daño al enemigo por completar el hábito principal del día. */
  habitDamage: number;
  /** Curación del enemigo al registrar un fallo/recaída. */
  missHeal: number;
}

/** Estado mutable del enemigo. */
export interface EnemyState {
  hpCurrent: number;
  hpMax: number;
}

/** Zona del mapa de aventura. */
export interface ZoneDef {
  key: string; // 'forest', 'mountain', ...
  /** Día (1-based) de la temporada en el que empieza la zona. */
  startDay: number;
}

/** Definición declarativa de una temporada. */
export interface SeasonDef {
  key: string; // 's1-reset'
  order: number; // orden de desbloqueo
  nameKey: string; // clave de copy del nombre ('RESET')
  /** Días CUMPLIDOS para completarla (no días de calendario). */
  durationDays: number;
  /** Hábito foco / misión principal (siempre presente cada día). */
  mainHabit: HabitKey;
  /** Hábitos ancla: secundarias FIJAS cada día (no rotan). El resto rota. */
  anchorHabits: HabitKey[];
  /** Hábitos sugeridos/activos de la temporada. */
  habits: HabitKey[];
  enemy: EnemyConfig;
  zones: ZoneDef[];
}

/** Progreso del jugador en una temporada (por días cumplidos). */
export interface SeasonProgress {
  seasonKey: string;
  daysCompleted: number;
  completed: boolean;
}

// ===========================================================================
// Eventos diarios (ver §9)
// ===========================================================================

/** A qué afecta el multiplicador de un evento. */
export type EventTarget =
  | { kind: 'habit'; habit: HabitKey }
  | { kind: 'all' }
  | { kind: 'enemy' };

export interface EventDef {
  key: string;
  multiplier: number;
  target: EventTarget;
  /** Peso para la selección ponderada. */
  weight: number;
  onlyWeekend?: boolean;
  onlyAfterRelapse?: boolean;
  /** Solo elegible cuando la racha supera este umbral de días. */
  onlyAfterStreak?: number;
}

/** Contexto para elegir el evento del día. */
export interface DailyEventContext {
  isWeekend: boolean;
  hadRelapseYesterday: boolean;
  /** Hábitos activos del jugador este día (para filtrar eventos de hábito específico). */
  activeHabits: HabitKey[];
  /** Racha actual del jugador (días consecutivos sin recaída). */
  currentStreak: number;
}

// ===========================================================================
// Misiones (ver §10)
// ===========================================================================

export interface Mission {
  habit: HabitKey;
  kind: 'main' | 'secondary';
  /** XP base (sin multiplicadores). */
  xp: number;
}

export interface DailyMissions {
  main: Mission;
  secondary: Mission[];
}

// ===========================================================================
// Mascota (ver §6)
// ===========================================================================

export type PetStage = 'egg' | 'hatchling' | 'juvenile' | 'adult' | 'final';
export type PetMood = 'happy' | 'ok' | 'tired' | 'sad';

// ===========================================================================
// Logros y equipamiento (ver §13, §8)
// ===========================================================================

/** Snapshot agregado del jugador para evaluar logros. */
export interface AchievementStats {
  level: number;
  trainings: number;
  alcoholFreeDays: number;
  kmWalked: number;
  reads: number;
  longestStreak: number;
  seasonsCompleted: number;
  perfectWeeks: number;
}

export interface AchievementDef {
  key: string;
  /** Predicado sobre el snapshot de estadísticas. */
  check: (stats: AchievementStats) => boolean;
  /** Clave i18n del hint (se muestra en logros bloqueados). */
  hintKey: string;
  /** Progreso numérico [current, target] o null para logros binarios. */
  progress?: (stats: AchievementStats) => { current: number; target: number };
}

export interface EquipmentDef {
  key: string;
  slot: string; // 'accessory', 'hands', 'feet', 'chest', 'back', 'head'
  /** Rareza del objeto (color/brillo, estilo Archero). */
  rarity: RarityKey;
  /** Origen del desbloqueo. */
  source?: 'achievement' | 'chest' | 'craft';
  /** Clave de copy que describe cómo se desbloquea. */
  unlockKey: string;
  /** Logro que lo desbloquea (vacío si es loot de cofre). */
  unlockedBy: string;
}
