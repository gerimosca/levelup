/**
 * Temporada 3 · CUT — 30 días. Come limpio, hidrátate, mantén el movimiento.
 * Antagonista: El Antojo. El impulso de rendirse ante el placer fácil.
 * Ver docs/design/02-game-design.md §11.
 */
import type { SeasonDef } from '../../types';

export const SEASON_3_CUT: SeasonDef = {
  key: 's3-cut',
  order: 3,
  nameKey: 'season.s3.name',
  durationDays: 30,
  mainHabit: 'eat_well',
  anchorHabits: ['water'], // hidratarse es el ancla universal de una "cut"

  habits: ['eat_well', 'water', 'no_alcohol', 'steps', 'train', 'sleep', 'meditate'],
  enemy: {
    key: 'craving',
    nameKey: 'enemy.craving.name',
    hpMax: 3000,
    habitDamage: 100,
    missHeal: 200,
  },
  // 7 zonas a lo largo de 30 días (≈ 1 zona cada ~4-5 días).
  zones: [
    { key: 'desert',  startDay: 1  },
    { key: 'oasis',   startDay: 5  },
    { key: 'dunes',   startDay: 10 },
    { key: 'mesa',    startDay: 15 },
    { key: 'canyon',  startDay: 20 },
    { key: 'spire',   startDay: 25 },
    { key: 'zenith',  startDay: 30 },
  ],
};
