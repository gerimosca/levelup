/**
 * enemy — El Saboteador (el alcohol como antagonista). Ver docs/design/02-game-design.md §7.
 *
 * Día cumpliendo el hábito objetivo → daño. Recaída → curación (nunca game over).
 */
import type { EnemyConfig, EnemyState } from '../types';

export function createEnemy(config: EnemyConfig): EnemyState {
  return { hpCurrent: config.hpMax, hpMax: config.hpMax };
}

/** Aplica daño de cualquier hábito (distinto de no_alcohol) al enemigo. */
export function applyHabitDamage(state: EnemyState, damage: number): EnemyState {
  return { ...state, hpCurrent: Math.max(0, state.hpCurrent - damage) };
}

/** Aplica el daño de un día limpio (con multiplicador de evento opcional). */
export function applyCleanDay(
  state: EnemyState,
  config: EnemyConfig,
  multiplier = 1,
): EnemyState {
  const damage = Math.round(config.cleanDayDamage * multiplier);
  return { ...state, hpCurrent: Math.max(0, state.hpCurrent - damage) };
}

/** Una recaída devuelve fuerza al enemigo (sin pasar de hpMax). */
export function applyRelapse(state: EnemyState, config: EnemyConfig): EnemyState {
  return {
    ...state,
    hpCurrent: Math.min(state.hpMax, state.hpCurrent + config.relapseHeal),
  };
}

export function enemyHpPct(state: EnemyState): number {
  return state.hpMax > 0 ? state.hpCurrent / state.hpMax : 0;
}

export function isEnemyDefeated(state: EnemyState): boolean {
  return state.hpCurrent <= 0;
}
