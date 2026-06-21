/**
 * Temporada 3 · CUT — 30 días. Come limpio, cero alcohol, mantén el movimiento.
 * Antagonista: El Antojo. Ver docs/design/02-game-design.md §11.
 */
import type { SeasonDef } from '../../types';

export const SEASON_3_CUT: SeasonDef = {
  key: 's3-cut',
  order: 3,
  nameKey: 'season.s3.name',
  durationDays: 30,
  mainHabit: 'eat_well',
  anchorHabits: ['no_alcohol'],

  habits: ['eat_well', 'no_alcohol', 'water', 'steps', 'train', 'sleep', 'meditate'],
  enemy: {
    key: 'craving',
    nameKey: 'enemy.craving.name',
    hpMax: 3000,
    cleanDayDamage: 100,
    relapseHeal: 200,
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
