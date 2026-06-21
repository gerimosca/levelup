/**
 * game-core/data/habits — Catálogo de hábitos del MVP.
 *
 * BALANCE: estos números definen la economía del juego. Cambiarlos NO requiere
 * tocar lógica (Open/Closed). Ver docs/design/02-game-design.md §2 y §4.
 */

import type { HabitDef, HabitKey } from '../types';

export const HABITS: Record<HabitKey, HabitDef> = {
  no_alcohol: {
    key: 'no_alcohol',
    baseXp: 150, // el más valioso: objetivo emocional central
    attribute: 'vitality',
    type: 'boolean',
  },
  train: {
    key: 'train',
    baseXp: 120,
    attribute: 'strength',
    type: 'boolean',
  },
  sleep: {
    key: 'sleep',
    baseXp: 80,
    attribute: 'energy',
    type: 'graded',
    // 0 XP por debajo de 5h; escala lineal 5h→7h; full a partir de 7h.
    graded: { min: 5, target: 7, step: 0.5 },
  },
  steps: {
    key: 'steps',
    baseXp: 70,
    attribute: 'resistance',
    type: 'graded',
    // 7 XP por cada 1.000 pasos hasta 10.000; bonus +20 si superas 15.000.
    graded: { target: 10000, step: 1000, bonus: { threshold: 15000, xp: 20 } },
  },
  eat_well: {
    key: 'eat_well',
    baseXp: 60,
    attribute: 'vitality',
    type: 'boolean',
  },
  read: {
    key: 'read',
    baseXp: 50,
    attribute: 'discipline',
    type: 'boolean',
  },
  water: {
    key: 'water',
    baseXp: 40,
    attribute: 'vitality',
    type: 'graded',
    // 10 XP por cada 0,5 L hasta 2 L.
    graded: { target: 2, step: 0.5 },
  },
  meditate: {
    key: 'meditate',
    baseXp: 30,
    attribute: 'discipline',
    type: 'boolean',
  },
};

/** Lista de hábitos en orden de valor (XP) descendente. */
export const HABIT_LIST: HabitDef[] = Object.values(HABITS).sort(
  (a, b) => b.baseXp - a.baseXp,
);

export function getHabit(key: HabitKey): HabitDef {
  return HABITS[key];
}
