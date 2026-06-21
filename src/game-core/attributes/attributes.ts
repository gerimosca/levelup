/**
 * attributes — Sub-progresión por área de vida. Ver docs/design/02-game-design.md §4.
 * Puramente expresivo (no hay combate por stats): son barras de progreso.
 */
import type { HabitDef } from '../types';

/** Puntos para subir de rango. */
export const ATTRIBUTE_RANK_SIZE = 100;

/** Puntos de atributo que otorga una acción: floor(XP_base / 10). */
export function attributePointsForHabit(habit: HabitDef): number {
  return Math.floor(habit.baseXp / 10);
}

/** Rango del atributo (I, II, III...) → empieza en 1. */
export function attributeRank(points: number): number {
  return Math.floor(Math.max(0, points) / ATTRIBUTE_RANK_SIZE) + 1;
}

/** Progreso dentro del rango actual, 0..1. */
export function attributeRankProgress(points: number): number {
  return (Math.max(0, points) % ATTRIBUTE_RANK_SIZE) / ATTRIBUTE_RANK_SIZE;
}

/** Atributo dominante: el que tiene más puntos acumulados. Null si el mapa está vacío. */
export function dominantAttribute(
  attrMap: Record<string, number>,
): { key: string; points: number } | null {
  const entries = Object.entries(attrMap).filter(([, pts]) => pts > 0);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { key: entries[0][0], points: entries[0][1] };
}
