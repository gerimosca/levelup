/**
 * Temporada 2 · STRENGTH — 30 días. Entrena, come bien y vence a la Inercia.
 * Ver docs/design/02-game-design.md §11.
 */
import type { SeasonDef } from '../../types';

export const SEASON_2_STRENGTH: SeasonDef = {
  key: 's2-strength',
  order: 2,
  nameKey: 'season.s2.name',
  durationDays: 30,
  mainHabit: 'train',
  anchorHabits: ['eat_well'], // comer bien es el ancla de Strength (fijo cada día; el resto rota)

  habits: ['train', 'eat_well', 'no_alcohol', 'steps', 'sleep', 'water', 'read', 'cold_shower', 'fasting'],
  enemy: {
    key: 'inertia',
    nameKey: 'enemy.inertia.name',
    hpMax: 3000,
    habitDamage: 100, // 30 días entrenando = 3000 = derrota
    missHeal: 200,
  },
  // 7 zonas a lo largo de 30 días (≈ 1 zona cada ~4-5 días).
  zones: [
    { key: 'plains', startDay: 1 },
    { key: 'hills', startDay: 5 },
    { key: 'gorge', startDay: 10 },
    { key: 'highlands', startDay: 15 },
    { key: 'ridge', startDay: 20 },
    { key: 'glacier', startDay: 25 },
    { key: 'summit', startDay: 30 },
  ],
};
