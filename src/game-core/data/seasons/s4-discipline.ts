/**
 * Temporada 4 · DISCIPLINE — 60 días. La prueba final. Medita, lee, no claudiques.
 * Antagonista: El Vacío. Ver docs/design/02-game-design.md §11.
 */
import type { SeasonDef } from '../../types';

export const SEASON_4_DISCIPLINE: SeasonDef = {
  key: 's4-discipline',
  order: 4,
  nameKey: 'season.s4.name',
  durationDays: 60,
  mainHabit: 'meditate',
  anchorHabits: ['read'],

  habits: ['meditate', 'read', 'no_alcohol', 'train', 'eat_well', 'water', 'sleep', 'steps', 'no_screens_bed', 'journaling'],
  enemy: {
    key: 'void',
    nameKey: 'enemy.void.name',
    hpMax: 6000,
    habitDamage: 100,
    missHeal: 300,
  },
  // 8 zonas a lo largo de 60 días (≈ 1 zona cada ~7-8 días).
  zones: [
    { key: 'sanctum',       startDay: 1  },
    { key: 'labyrinth',     startDay: 8  },
    { key: 'abyss',         startDay: 16 },
    { key: 'dreamscape',    startDay: 24 },
    { key: 'void_edge',     startDay: 32 },
    { key: 'mindscape',     startDay: 40 },
    { key: 'astral',        startDay: 50 },
    { key: 'transcendence', startDay: 60 },
  ],
};
