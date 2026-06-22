/**
 * Temporada 1 · RESET — 21 días cumplidos. Entrena, duerme, muévete, hidrátate.
 * Antagonista: La Pereza. Enemigo universal — el primer jefe que todos tienen que vencer.
 * Ver docs/design/02-game-design.md §7, §11, §12.
 */
import type { SeasonDef } from '../../types';

export const SEASON_1_RESET: SeasonDef = {
  key: 's1-reset',
  order: 1,
  nameKey: 'season.s1.name', // "RESET"
  durationDays: 21,
  mainHabit: 'train',
  anchorHabits: ['sleep'], // dormir bien es el ancla universal; el resto rota
  habits: ['train', 'sleep', 'no_alcohol', 'water', 'steps'],
  enemy: {
    key: 'laziness',
    nameKey: 'enemy.laziness.name', // "La Pereza"
    hpMax: 2100,
    habitDamage: 100, // 21 días entrenando = 2100 = derrota
    missHeal: 150,
  },
  // 8 zonas a lo largo de los 21 días (≈ 1 zona cada ~3 días).
  zones: [
    { key: 'forest', startDay: 1 },
    { key: 'mountain', startDay: 4 },
    { key: 'cave', startDay: 7 },
    { key: 'volcano', startDay: 10 },
    { key: 'temple', startDay: 13 },
    { key: 'city', startDay: 16 },
    { key: 'castle', startDay: 19 },
    { key: 'summit', startDay: 21 },
  ],
};
