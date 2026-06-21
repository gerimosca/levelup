/**
 * game-core/streak — Racha y su bonus de XP global.
 *
 * La racha cuenta días consecutivos cumpliendo (al menos) la misión principal.
 * Bonus suave a propósito: premia sin que romper la racha sea catastrófico.
 * Ver docs/design/02-game-design.md §2.3.
 */

/** Tramos del multiplicador de racha (días mínimos → multiplicador). */
const STREAK_TIERS: { minDays: number; multiplier: number }[] = [
  { minDays: 100, multiplier: 1.25 },
  { minDays: 30, multiplier: 1.2 },
  { minDays: 14, multiplier: 1.15 },
  { minDays: 7, multiplier: 1.1 },
  { minDays: 3, multiplier: 1.05 },
  { minDays: 0, multiplier: 1.0 },
];

/** Multiplicador global de XP según los días de racha actuales. */
export function streakMultiplier(streakDays: number): number {
  const tier = STREAK_TIERS.find((t) => streakDays >= t.minDays);
  return tier ? tier.multiplier : 1.0;
}

/**
 * Calcula la nueva racha al cumplir hoy.
 * @param current        Racha actual (días).
 * @param daysSinceLast  Días transcurridos desde el último día activo.
 *                       1 = día consecutivo, 0 = mismo día (ya contado),
 *                       >1 = se rompió la racha.
 */
export function nextStreak(current: number, daysSinceLast: number): number {
  if (daysSinceLast === 0) return current; // ya activo hoy, no doble cuenta
  if (daysSinceLast === 1) return current + 1; // día consecutivo
  return 1; // hueco: la racha se reinicia, hoy cuenta como día 1
}
