/**
 * enemy — El antagonista de cada temporada. Ver docs/design/02-game-design.md §7.
 *
 * Completar el hábito principal del día → daño al enemigo. Fallo/recaída → curación.
 * Nunca hay game over: el enemigo no puede matar al héroe.
 */
import type { EnemyConfig, EnemyState } from '../types';

export function createEnemy(config: EnemyConfig): EnemyState {
  return { hpCurrent: config.hpMax, hpMax: config.hpMax };
}

/** Aplica daño de hábitos secundarios al enemigo. */
export function applyHabitDamage(state: EnemyState, damage: number): EnemyState {
  return { ...state, hpCurrent: Math.max(0, state.hpCurrent - damage) };
}

/** Daño al enemigo por completar el hábito principal (con multiplicador de evento opcional). */
export function applyDayCompleted(
  state: EnemyState,
  config: EnemyConfig,
  multiplier = 1,
): EnemyState {
  const damage = Math.round(config.habitDamage * multiplier);
  return { ...state, hpCurrent: Math.max(0, state.hpCurrent - damage) };
}

/** Un fallo/recaída devuelve fuerza al enemigo (sin pasar de hpMax). */
export function applySetback(state: EnemyState, config: EnemyConfig): EnemyState {
  return {
    ...state,
    hpCurrent: Math.min(state.hpMax, state.hpCurrent + config.missHeal),
  };
}

export function enemyHpPct(state: EnemyState): number {
  return state.hpMax > 0 ? state.hpCurrent / state.hpMax : 0;
}

export function isEnemyDefeated(state: EnemyState): boolean {
  return state.hpCurrent <= 0;
}
