/**
 * Botín de la expedición (materiales variables, NUNCA XP). Sembrado por seed
 * (`userId:fecha`) → determinista pero con variedad ("¿qué tocará hoy?").
 * Ver docs/design/08-world-spec.md §2.
 */
import { seededUnit } from '../lib/seeded-random';

export type ExpeditionTier = 'quiet' | 'good' | 'great';

export interface ExpeditionReward {
  wood: number;
  stone: number;
  tier: ExpeditionTier;
}

/** Calcula el botín de una expedición de forma determinista por seed. */
export function computeExpeditionReward(seed: string): ExpeditionReward {
  const roll = seededUnit(seed);
  const tier: ExpeditionTier = roll < 0.55 ? 'quiet' : roll < 0.9 ? 'good' : 'great';

  const woodBase = tier === 'quiet' ? 3 : tier === 'good' ? 5 : 8;
  const stoneBase = tier === 'quiet' ? 1 : tier === 'good' ? 3 : 5;

  const wood = woodBase + Math.floor(seededUnit(`${seed}:w`) * 3);
  const stone = stoneBase + Math.floor(seededUnit(`${seed}:s`) * 3);

  return { wood, stone, tier };
}
