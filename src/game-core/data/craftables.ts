/**
 * Catálogo de items craftables. Cada item tiene un coste en materiales y
 * desbloquea un item cosmético (source: 'craft' en equipment.ts).
 * NUNCA dan XP — solo cosméticos.
 */

export interface CraftableItemDef {
  /** Clave del item de equipamiento (en EQUIPMENT). */
  key: string;
  /** Coste en materiales: { wood, stone, ... }. */
  cost: Record<string, number>;
}

export const CRAFTABLE_ITEMS: CraftableItemDef[] = [
  { key: 'iron_clasp',     cost: { wood: 15 } },
  { key: 'stone_ring',     cost: { wood: 10, stone: 20 } },
  { key: 'forest_wrap',    cost: { wood: 30 } },
  { key: 'ember_talisman', cost: { wood: 20, stone: 40 } },
  { key: 'granite_badge',  cost: { stone: 60 } },
  { key: 'crystal_amulet', cost: { wood: 50, stone: 50 } },
];

export const CRAFTABLE_BY_KEY: Record<string, CraftableItemDef> = Object.fromEntries(
  CRAFTABLE_ITEMS.map((c) => [c.key, c]),
);
