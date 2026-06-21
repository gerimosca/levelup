/**
 * game-core/xp/calculateXp — Cálculo de XP ganada por una acción.
 *
 * Ver docs/design/02-game-design.md §2 (XP base, parcial y multiplicadores).
 */

import type { HabitDef, XpMultipliers } from '../types';

/**
 * XP base que otorga un hábito para un `value` dado, SIN multiplicadores.
 * - boolean: baseXp si value es "verdadero" (>0 / true), 0 en caso contrario.
 * - graded: XP proporcional por tramos (step), con suelo (min) y bonus opcional.
 */
export function calculateHabitXp(habit: HabitDef, value: number | boolean = true): number {
  if (habit.type === 'boolean') {
    return value ? habit.baseXp : 0;
  }

  const g = habit.graded;
  const numeric = typeof value === 'boolean' ? (value ? Infinity : 0) : value;
  if (!g) return numeric > 0 ? habit.baseXp : 0;

  const min = g.min ?? 0;
  const totalSteps = (g.target - min) / g.step;
  const completedSteps = Math.min(
    Math.max(Math.floor((numeric - min) / g.step), 0),
    totalSteps,
  );

  let xp = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * habit.baseXp) : 0;

  if (g.bonus && numeric >= g.bonus.threshold) {
    xp += g.bonus.xp;
  }

  return xp;
}

/**
 * Aplica los multiplicadores (evento diario sobre la acción + racha global)
 * al XP base y redondea. Ver §2.2 y §2.3.
 */
export function applyMultipliers(baseXp: number, mult: XpMultipliers = {}): number {
  const event = mult.event ?? 1;
  const streak = mult.streak ?? 1;
  return Math.round(baseXp * event * streak);
}

/** Atajo: XP final de un hábito con value y multiplicadores en un paso. */
export function calculateReward(
  habit: HabitDef,
  value: number | boolean = true,
  mult: XpMultipliers = {},
): number {
  return applyMultipliers(calculateHabitXp(habit, value), mult);
}
