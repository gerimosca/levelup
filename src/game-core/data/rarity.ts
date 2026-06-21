/**
 * Sistema de rareza (inspiración Archero): el equipamiento sube de rareza y se
 * distingue por color + brillo. Refuerza la sensación de progreso constante.
 * Ver docs/design/03-ux-ui.md §10 (Dirección Archero).
 */

export type RarityKey = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface RarityDef {
  /** Orden ascendente (para comparar y elegir la rareza dominante). */
  order: number;
  /** Color principal de la rareza. */
  color: string;
  /** Glow (sombra/aura) de la rareza. */
  glow: string;
}

export const RARITY: Record<RarityKey, RarityDef> = {
  common: { order: 0, color: '#9CA3AF', glow: 'rgba(156,163,175,0.55)' },
  rare: { order: 1, color: '#3B82F6', glow: 'rgba(59,130,246,0.65)' },
  epic: { order: 2, color: '#A855F7', glow: 'rgba(168,85,247,0.65)' },
  legendary: { order: 3, color: '#F59E0B', glow: 'rgba(245,158,11,0.75)' },
  mythic:    { order: 4, color: '#FF2D78', glow: 'rgba(255,45,120,0.90)' },
};

/** Rareza dominante (la de mayor orden) de un conjunto. */
export function topRarity(rarities: RarityKey[]): RarityKey | null {
  if (rarities.length === 0) return null;
  return rarities.reduce((a, b) => (RARITY[b].order > RARITY[a].order ? b : a));
}
