/**
 * achievements — Evaluación de logros desbloqueados. Ver docs/design/02-game-design.md §13.
 */
import type { AchievementStats } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

/**
 * Devuelve las claves de los logros que se acaban de desbloquear (cumplen su
 * predicado y no estaban ya desbloqueados).
 */
export function evaluateAchievements(
  stats: AchievementStats,
  unlocked: ReadonlySet<string>,
): string[] {
  return ACHIEVEMENTS.filter((a) => !unlocked.has(a.key) && a.check(stats)).map(
    (a) => a.key,
  );
}
