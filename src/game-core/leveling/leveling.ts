/**
 * game-core/leveling — Resolver nivel y tier a partir del XP total.
 */

import type { CharacterTier, LevelInfo } from '../types';
import { MAX_LEVEL, xpToNext } from '../data/levels';

/** Umbrales de tier visual (nivel mínimo de cada tier). */
const TIER_THRESHOLDS: { tier: CharacterTier; minLevel: number }[] = [
  { tier: 'legend', minLevel: 50 },
  { tier: 'hero', minLevel: 35 },
  { tier: 'veteran', minLevel: 20 },
  { tier: 'warrior', minLevel: 10 },
  { tier: 'apprentice', minLevel: 5 },
  { tier: 'initiate', minLevel: 1 },
];

/** Tier visual del personaje según su nivel. */
export function tierForLevel(level: number): CharacterTier {
  const found = TIER_THRESHOLDS.find((t) => level >= t.minLevel);
  return found ? found.tier : 'initiate';
}

/**
 * Dado el XP total acumulado, devuelve nivel, progreso dentro del nivel y tier.
 * Determinista: misma entrada → misma salida.
 */
export function levelFromTotalXp(xpTotal: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xpTotal));

  while (level < MAX_LEVEL) {
    const cost = xpToNext(level);
    if (remaining < cost) break;
    remaining -= cost;
    level += 1;
  }

  const xpForNext = xpToNext(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpForNext,
    progress: xpForNext > 0 ? remaining / xpForNext : 0,
    tier: tierForLevel(level),
  };
}
