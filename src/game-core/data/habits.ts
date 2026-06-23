/**
 * game-core/data/habits — Catálogo de hábitos.
 *
 * BALANCE: rango comprimido 70-150 XP para que todo hábito valga la pena.
 * no_alcohol y train tienen el mismo peso (150) — son los dos ejes del juego.
 * Cambiar números NO requiere tocar lógica (Open/Closed).
 */

import type { HabitDef, HabitKey } from '../types';

export const HABITS: Record<HabitKey, HabitDef> = {
  // ── Pilares principales (150 XP) ──────────────────────────────────────────
  no_alcohol: {
    key: 'no_alcohol',
    baseXp: 150, // la batalla central — igual que entrenar
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 100,
  },
  train: {
    key: 'train',
    baseXp: 150, // la batalla universal contra la pereza
    attribute: 'strength',
    type: 'boolean',
    enemyDamage: 100,
  },

  // ── Segunda línea (110-130 XP) ────────────────────────────────────────────
  no_smoking: {
    key: 'no_smoking',
    baseXp: 130,
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 80,
  },
  fasting: {
    key: 'fasting',
    baseXp: 110,
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 65,
  },
  sleep: {
    key: 'sleep',
    baseXp: 100,
    attribute: 'energy',
    type: 'graded',
    graded: { min: 5, target: 7, step: 0.5 },
    enemyDamage: 55,
  },

  // ── Tercer bloque (80-90 XP) ──────────────────────────────────────────────
  cold_shower: {
    key: 'cold_shower',
    baseXp: 90,
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 52,
  },
  steps: {
    key: 'steps',
    baseXp: 85,
    attribute: 'resistance',
    type: 'graded',
    graded: { target: 10000, step: 1000, bonus: { threshold: 15000, xp: 20 } },
    enemyDamage: 48,
  },
  eat_well: {
    key: 'eat_well',
    baseXp: 85,
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 48,
  },
  no_social_media: {
    key: 'no_social_media',
    baseXp: 82,
    attribute: 'discipline',
    type: 'boolean',
    enemyDamage: 45,
  },
  no_junk_food: {
    key: 'no_junk_food',
    baseXp: 80,
    attribute: 'vitality',
    type: 'boolean',
    enemyDamage: 44,
  },

  // ── Cuarto bloque (70-80 XP) ──────────────────────────────────────────────
  outdoor_time: {
    key: 'outdoor_time',
    baseXp: 78,
    attribute: 'resistance',
    type: 'boolean',
    enemyDamage: 42,
  },
  no_screens_bed: {
    key: 'no_screens_bed',
    baseXp: 75,
    attribute: 'energy',
    type: 'boolean',
    enemyDamage: 40,
  },
  read: {
    key: 'read',
    baseXp: 75,
    attribute: 'discipline',
    type: 'boolean',
    enemyDamage: 38,
  },
  water: {
    key: 'water',
    baseXp: 72,
    attribute: 'vitality',
    type: 'graded',
    graded: { target: 2, step: 0.5 },
    enemyDamage: 36,
  },
  meditate: {
    key: 'meditate',
    baseXp: 72,
    attribute: 'discipline',
    type: 'boolean',
    enemyDamage: 36,
  },
  journaling: {
    key: 'journaling',
    baseXp: 70,
    attribute: 'discipline',
    type: 'boolean',
    enemyDamage: 34,
  },
};

/** Lista de hábitos en orden de valor (XP) descendente. */
export const HABIT_LIST: HabitDef[] = Object.values(HABITS).sort(
  (a, b) => b.baseXp - a.baseXp,
);

export function getHabit(key: HabitKey): HabitDef {
  return HABITS[key];
}
