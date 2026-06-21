/**
 * Temporada 1 · RESET — 21 días cumplidos. Sin alcohol, entrenar, dormir, agua, caminar.
 * Antagonista: El Saboteador. Ver docs/design/02-game-design.md §7, §11, §12.
 */
import type { SeasonDef } from '../../types';

export const SEASON_1_RESET: SeasonDef = {
  key: 's1-reset',
  order: 1,
  nameKey: 'season.s1.name', // "RESET"
  durationDays: 21,
  mainHabit: 'train',
  anchorHabits: ['no_alcohol'], // no beber es fijo cada día; el resto rota
  habits: ['no_alcohol', 'train', 'sleep', 'water', 'steps'],
  enemy: {
    key: 'saboteur',
    nameKey: 'enemy.saboteur.name', // "El Saboteador"
    hpMax: 2100,
    cleanDayDamage: 100, // 21 días limpios = 2100 = derrota
    relapseHeal: 150,
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
