/**
 * game-core/data/levels — Curva de niveles.
 *
 * Coste para subir de nivel L → L+1:  round(100 * L^1.7)
 * Diseño: primeros niveles rápidos (dopamina inicial), luego la curva sube con
 * fuerza para que subir de nivel sea un logro de verdad (constancia de semanas).
 * Ver docs/design/02-game-design.md §3.
 */

/** Constante base de la curva. Configurable para rebalancear. */
export const LEVEL_CURVE_BASE = 100;
export const LEVEL_CURVE_EXPONENT = 1.7;

/** Tope de nivel para acotar bucles (no es un límite "real" para el jugador). */
export const MAX_LEVEL = 999;

/** XP necesaria para subir del nivel `level` al `level + 1`. */
export function xpToNext(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return Math.round(LEVEL_CURVE_BASE * Math.pow(l, LEVEL_CURVE_EXPONENT));
}

/**
 * XP TOTAL acumulada necesaria para *alcanzar* `level`.
 * Nivel 1 = 0. Es el "suelo" de XP del nivel (usado por la penalización).
 */
export function cumulativeXpForLevel(level: number): number {
  const target = Math.max(1, Math.floor(level));
  let sum = 0;
  for (let l = 1; l < target; l++) sum += xpToNext(l);
  return sum;
}
