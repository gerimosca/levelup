/**
 * Catálogo de descubrimientos (enciclopedia). Se encuentran en expediciones.
 * Coleccionables, no funcionales (no dan XP ni stats). Ver docs/design/08-world-spec.md §2.
 */
import type { RarityKey } from './rarity';
import { RARITY } from './rarity';
import { seededUnit, pickWeighted } from '../lib/seeded-random';

export type DiscoveryCategory = 'flora' | 'fauna' | 'recipe' | 'relic' | 'place';

export interface DiscoveryDef {
  key: string;
  category: DiscoveryCategory;
  rarity: RarityKey;
  emoji: string;
}

export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  'flora',
  'fauna',
  'recipe',
  'relic',
  'place',
];

export const DISCOVERIES: DiscoveryDef[] = [
  // Flora
  { key: 'forest_herb', category: 'flora', rarity: 'common', emoji: '🌿' },
  { key: 'sunbloom', category: 'flora', rarity: 'common', emoji: '🌻' },
  { key: 'glowing_mushroom', category: 'flora', rarity: 'rare', emoji: '🍄' },
  { key: 'rare_flower', category: 'flora', rarity: 'rare', emoji: '🌸' },
  // Fauna
  { key: 'mountain_deer', category: 'fauna', rarity: 'common', emoji: '🦌' },
  { key: 'rare_butterfly', category: 'fauna', rarity: 'rare', emoji: '🦋' },
  { key: 'golden_bee', category: 'fauna', rarity: 'rare', emoji: '🐝' },
  { key: 'wise_owl', category: 'fauna', rarity: 'epic', emoji: '🦉' },
  { key: 'fire_fox', category: 'fauna', rarity: 'epic', emoji: '🦊' },
  // Recetas
  { key: 'old_recipe', category: 'recipe', rarity: 'common', emoji: '📜' },
  { key: 'hearty_stew', category: 'recipe', rarity: 'common', emoji: '🍲' },
  { key: 'calm_tea', category: 'recipe', rarity: 'rare', emoji: '🍵' },
  // Reliquias
  { key: 'old_coin', category: 'relic', rarity: 'common', emoji: '🪙' },
  { key: 'ancient_vase', category: 'relic', rarity: 'rare', emoji: '🏺' },
  { key: 'stone_idol', category: 'relic', rarity: 'epic', emoji: '🗿' },
  { key: 'sacred_amulet', category: 'relic', rarity: 'epic', emoji: '📿' },
  // Lugares
  { key: 'hidden_cave', category: 'place', rarity: 'rare', emoji: '🕳️' },
  { key: 'ancient_temple', category: 'place', rarity: 'legendary', emoji: '🏛️' },
  { key: 'volcano_peak', category: 'place', rarity: 'legendary', emoji: '🌋' },
];

export const DISCOVERIES_BY_KEY: Record<string, DiscoveryDef> = Object.fromEntries(
  DISCOVERIES.map((d) => [d.key, d]),
);

/**
 * Posible descubrimiento de una expedición (sembrado por seed). Devuelve null
 * ~40% de las veces o si ya está todo encontrado. Prioriza rarezas bajas primero.
 */
export function computeExpeditionDiscovery(
  seed: string,
  foundKeys: ReadonlySet<string>,
): DiscoveryDef | null {
  const undiscovered = DISCOVERIES.filter((d) => !foundKeys.has(d.key));
  if (undiscovered.length === 0) return null;
  if (seededUnit(`${seed}:disc`) > 0.6) return null;
  return pickWeighted(`${seed}:discpick`, undiscovered, (d) => 4 - RARITY[d.rarity].order);
}
