/**
 * Catálogo de logros (arranque ~25, ampliable). Ver docs/design/02-game-design.md §13.
 * Cada logro es un predicado puro sobre un snapshot de estadísticas.
 */
import type { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  // Primeras veces
  { key: 'first_training', check: (s) => s.trainings >= 1 },
  { key: 'first_clean_day', check: (s) => s.alcoholFreeDays >= 1 },
  // Constancia (rachas)
  { key: 'streak_7', check: (s) => s.longestStreak >= 7 },
  { key: 'streak_21', check: (s) => s.longestStreak >= 21 },
  { key: 'streak_30', check: (s) => s.longestStreak >= 30 },
  { key: 'streak_50', check: (s) => s.longestStreak >= 50 },
  { key: 'streak_100', check: (s) => s.longestStreak >= 100 },
  { key: 'streak_365', check: (s) => s.longestStreak >= 365 },
  // Sin alcohol
  { key: 'clean_7', check: (s) => s.alcoholFreeDays >= 7 },
  { key: 'clean_30', check: (s) => s.alcoholFreeDays >= 30 },
  { key: 'clean_100', check: (s) => s.alcoholFreeDays >= 100 },
  // Volumen
  { key: 'trainings_100', check: (s) => s.trainings >= 100 },
  { key: 'km_50', check: (s) => s.kmWalked >= 50 },
  { key: 'reads_100', check: (s) => s.reads >= 100 },
  // Progresión
  { key: 'level_5', check: (s) => s.level >= 5 },
  { key: 'level_10', check: (s) => s.level >= 10 },
  { key: 'level_25', check: (s) => s.level >= 25 },
  { key: 'level_50', check: (s) => s.level >= 50 },
  // Temporadas
  { key: 'season_1_done', check: (s) => s.seasonsCompleted >= 1 },
  { key: 'all_seasons', check: (s) => s.seasonsCompleted >= 4 },
  // Específicos
  { key: 'perfect_week', check: (s) => s.perfectWeeks >= 1 },
];

export const ACHIEVEMENTS_BY_KEY: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.key, a]),
);
