/**
 * game-core/xp/penalty — Penalización por fallar ("El personaje se oxida").
 *
 * Decisión del usuario (override del brief original "sin castigos"):
 * cada hábito ACTIVO no cumplido en el día resta XP de forma INDEPENDIENTE,
 * PERO con red de seguridad: el XP nunca baja del umbral del nivel actual,
 * así que NUNCA se baja de nivel. Filosofía: consecuencia sin culpa.
 *
 * Ver docs/design/02-game-design.md §2.4.
 */

import type { HabitDef } from '../types';
import { cumulativeXpForLevel } from '../data/levels';
import { levelFromTotalXp } from '../leveling/leveling';

/** Fracción del XP base que se pierde por hábito fallado. Configurable. */
export const MISS_PENALTY_RATIO = 0.25;

/** Penalización (positiva) por fallar un hábito concreto. */
export function penaltyForHabit(habit: HabitDef): number {
  return Math.round(habit.baseXp * MISS_PENALTY_RATIO);
}

export interface DecayResult {
  /** XP total tras aplicar la penalización (nunca por debajo del suelo de nivel). */
  newXpTotal: number;
  /** XP efectivamente perdida (puede ser menor que la teórica por el suelo). */
  xpLost: number;
  /** Penalización teórica antes de aplicar el suelo. */
  rawPenalty: number;
}

/**
 * Aplica el decay diario por hábitos activos no cumplidos.
 *
 * @param xpTotal        XP total actual del jugador.
 * @param missedHabits   Hábitos ACTIVOS que el jugador no completó en el día.
 * @returns Resultado con el nuevo XP total respetando el suelo del nivel actual.
 *
 * Red de seguridad: el suelo es la XP acumulada para *alcanzar* el nivel actual,
 * por lo que el jugador puede quedarse al inicio de su nivel pero nunca retroceder.
 */
export function applyDailyDecay(xpTotal: number, missedHabits: HabitDef[]): DecayResult {
  const rawPenalty = missedHabits.reduce((sum, h) => sum + penaltyForHabit(h), 0);

  const { level } = levelFromTotalXp(xpTotal);
  const floor = cumulativeXpForLevel(level);

  const newXpTotal = Math.max(floor, xpTotal - rawPenalty);
  return {
    newXpTotal,
    xpLost: xpTotal - newXpTotal,
    rawPenalty,
  };
}
