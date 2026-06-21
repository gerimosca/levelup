import type { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  // Primeras veces
  {
    key: 'first_training',
    hintKey: 'achievements.first_training.hint',
    check: (s) => s.trainings >= 1,
  },
  {
    key: 'first_clean_day',
    hintKey: 'achievements.first_clean_day.hint',
    check: (s) => s.alcoholFreeDays >= 1,
  },
  // Constancia (rachas)
  {
    key: 'streak_7',
    hintKey: 'achievements.streak_7.hint',
    check: (s) => s.longestStreak >= 7,
    progress: (s) => ({ current: Math.min(s.longestStreak, 7), target: 7 }),
  },
  {
    key: 'streak_21',
    hintKey: 'achievements.streak_21.hint',
    check: (s) => s.longestStreak >= 21,
    progress: (s) => ({ current: Math.min(s.longestStreak, 21), target: 21 }),
  },
  {
    key: 'streak_30',
    hintKey: 'achievements.streak_30.hint',
    check: (s) => s.longestStreak >= 30,
    progress: (s) => ({ current: Math.min(s.longestStreak, 30), target: 30 }),
  },
  {
    key: 'streak_50',
    hintKey: 'achievements.streak_50.hint',
    check: (s) => s.longestStreak >= 50,
    progress: (s) => ({ current: Math.min(s.longestStreak, 50), target: 50 }),
  },
  {
    key: 'streak_100',
    hintKey: 'achievements.streak_100.hint',
    check: (s) => s.longestStreak >= 100,
    progress: (s) => ({ current: Math.min(s.longestStreak, 100), target: 100 }),
  },
  {
    key: 'streak_365',
    hintKey: 'achievements.streak_365.hint',
    check: (s) => s.longestStreak >= 365,
    progress: (s) => ({ current: Math.min(s.longestStreak, 365), target: 365 }),
  },
  // Sin alcohol
  {
    key: 'clean_7',
    hintKey: 'achievements.clean_7.hint',
    check: (s) => s.alcoholFreeDays >= 7,
    progress: (s) => ({ current: Math.min(s.alcoholFreeDays, 7), target: 7 }),
  },
  {
    key: 'clean_30',
    hintKey: 'achievements.clean_30.hint',
    check: (s) => s.alcoholFreeDays >= 30,
    progress: (s) => ({ current: Math.min(s.alcoholFreeDays, 30), target: 30 }),
  },
  {
    key: 'clean_100',
    hintKey: 'achievements.clean_100.hint',
    check: (s) => s.alcoholFreeDays >= 100,
    progress: (s) => ({ current: Math.min(s.alcoholFreeDays, 100), target: 100 }),
  },
  // Volumen
  {
    key: 'trainings_100',
    hintKey: 'achievements.trainings_100.hint',
    check: (s) => s.trainings >= 100,
    progress: (s) => ({ current: Math.min(s.trainings, 100), target: 100 }),
  },
  {
    key: 'km_50',
    hintKey: 'achievements.km_50.hint',
    check: (s) => s.kmWalked >= 50,
    progress: (s) => ({ current: Math.min(Math.floor(s.kmWalked), 50), target: 50 }),
  },
  {
    key: 'reads_100',
    hintKey: 'achievements.reads_100.hint',
    check: (s) => s.reads >= 100,
    progress: (s) => ({ current: Math.min(s.reads, 100), target: 100 }),
  },
  // Progresión
  {
    key: 'level_5',
    hintKey: 'achievements.level_5.hint',
    check: (s) => s.level >= 5,
    progress: (s) => ({ current: Math.min(s.level, 5), target: 5 }),
  },
  {
    key: 'level_10',
    hintKey: 'achievements.level_10.hint',
    check: (s) => s.level >= 10,
    progress: (s) => ({ current: Math.min(s.level, 10), target: 10 }),
  },
  {
    key: 'level_25',
    hintKey: 'achievements.level_25.hint',
    check: (s) => s.level >= 25,
    progress: (s) => ({ current: Math.min(s.level, 25), target: 25 }),
  },
  {
    key: 'level_50',
    hintKey: 'achievements.level_50.hint',
    check: (s) => s.level >= 50,
    progress: (s) => ({ current: Math.min(s.level, 50), target: 50 }),
  },
  // Temporadas
  {
    key: 'season_1_done',
    hintKey: 'achievements.season_1_done.hint',
    check: (s) => s.seasonsCompleted >= 1,
    progress: (s) => ({ current: Math.min(s.seasonsCompleted, 1), target: 1 }),
  },
  {
    key: 'all_seasons',
    hintKey: 'achievements.all_seasons.hint',
    check: (s) => s.seasonsCompleted >= 4,
    progress: (s) => ({ current: Math.min(s.seasonsCompleted, 4), target: 4 }),
  },
  // Específicos
  {
    key: 'perfect_week',
    hintKey: 'achievements.perfect_week.hint',
    check: (s) => s.perfectWeeks >= 1,
    progress: (s) => ({ current: Math.min(s.perfectWeeks, 1), target: 1 }),
  },
];

export const ACHIEVEMENTS_BY_KEY: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.key, a]),
);
