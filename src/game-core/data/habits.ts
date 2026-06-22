/**
 * game-core/data/habits — Catálogo de hábitos del MVP.
 *
 * BALANCE: estos números definen la economía del juego. Cambiarlos NO requiere
 * tocar lógica (Open/Closed). Ver docs/design/02-game-design.md §2 y §4.
 *
 * Filosofía: mejorar el estilo de vida en general. Entrenar encabeza el ranking
 * como la batalla universal contra la pereza. No beber alcohol es igualmente
 * importante pero no es el único eje del juego.
 */

import type { HabitDef, HabitKey } from '../types';

export const HABITS: Record<HabitKey, HabitDef> = {
  no_alcohol: {
    key: 'no_alcohol',
    baseXp: 120, // poderoso, pero no el único hábito central
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 80,
  },
  train: {
    key: 'train',
    baseXp: 150, // el más valioso: la batalla universal contra la pereza
    attribute: 'strength',
    type: 'boolean',
    enemyDamage: 100, // daño principal — es el mainHabit de S1 y S2
  },
  sleep: {
    key: 'sleep',
    baseXp: 80,
    attribute: 'energy',
    type: 'graded',
    graded: { min: 5, target: 7, step: 0.5 },
    enemyDamage: 35,
  },
  steps: {
    key: 'steps',
    baseXp: 70,
    attribute: 'resistance',
    type: 'graded',
    graded: { target: 10000, step: 1000, bonus: { threshold: 15000, xp: 20 } },
    enemyDamage: 30,
  },
  eat_well: {
    key: 'eat_well',
    baseXp: 60,
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 25,
  },
  read: {
    key: 'read',
    baseXp: 50,
    attribute: 'discipline',
    type: 'boolean',
    enemyDamage: 20,
  },
  water: {
    key: 'water',
    baseXp: 40,
    attribute: 'vitality',
    type: 'graded',
    graded: { target: 2, step: 0.5 },
    enemyDamage: 15,
  },
  meditate: {
    key: 'meditate',
    baseXp: 30,
    attribute: 'discipline',
    type: 'boolean',
    enemyDamage: 10,
  },
  no_smoking: {
    key: 'no_smoking',
    baseXp: 110, // gran batalla — comparable al alcohol
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 70,
  },
  no_social_media: {
    key: 'no_social_media',
    baseXp: 65, // batalla moderna de atención y foco
    attribute: 'discipline',
    type: 'boolean',
    enemyDamage: 30,
  },
  no_junk_food: {
    key: 'no_junk_food',
    baseXp: 45, // refuerza eat_well — nada de procesados
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 18,
  },
};

/** Lista de hábitos en orden de valor (XP) descendente. */
export const HABIT_LIST: HabitDef[] = Object.values(HABITS).sort(
  (a, b) => b.baseXp - a.baseXp,
);

export function getHabit(key: HabitKey): HabitDef {
  return HABITS[key];
}
