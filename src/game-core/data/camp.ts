/**
 * Árbol de construcción del campamento. Se construye en orden, con materiales.
 * Algunas estructuras traen un NPC (habitante). Ver docs/design/08-world-spec.md §3.
 */
import type { MaterialKey } from './world';

export interface CampStructureDef {
  key: string;
  order: number; // 0 = tienda inicial (siempre presente); el resto se construye en orden
  cost: Partial<Record<MaterialKey, number>>;
  /** NPC que llega al construirla (clave en data/npcs). */
  npc?: string;
}

export const CAMP_STRUCTURES: CampStructureDef[] = [
  { key: 'tent', order: 0, cost: {} },
  { key: 'campfire', order: 1, cost: { wood: 8 }, npc: 'elder' },
  { key: 'house', order: 2, cost: { wood: 16, stone: 6 } },
  { key: 'grove', order: 3, cost: { wood: 24, stone: 8 }, npc: 'explorer' },
  { key: 'workshop', order: 4, cost: { wood: 34, stone: 18 }, npc: 'blacksmith' },
  { key: 'stable', order: 5, cost: { wood: 44, stone: 26 } },
  { key: 'gardens', order: 6, cost: { wood: 54, stone: 30 } },
  { key: 'fountain', order: 7, cost: { wood: 60, stone: 40 } },
  { key: 'library', order: 8, cost: { wood: 78, stone: 48 }, npc: 'librarian' },
  { key: 'gym', order: 9, cost: { wood: 92, stone: 60 }, npc: 'trainer' },
  { key: 'statues', order: 10, cost: { wood: 110, stone: 80 } },
  { key: 'market', order: 11, cost: { wood: 130, stone: 95 }, npc: 'cook' },
];

export const CAMP_STRUCTURES_BY_KEY: Record<string, CampStructureDef> = Object.fromEntries(
  CAMP_STRUCTURES.map((s) => [s.key, s]),
);

/** Estructura inicial siempre presente. */
export const STARTING_STRUCTURE = 'tent';

/** Siguiente estructura a construir (la primera del árbol aún no construida). */
export function nextStructure(built: ReadonlySet<string>): CampStructureDef | null {
  return CAMP_STRUCTURES.filter((s) => s.order > 0).find((s) => !built.has(s.key)) ?? null;
}

/** ¿Hay materiales suficientes para una estructura? */
export function canAfford(
  cost: Partial<Record<MaterialKey, number>>,
  inventory: Record<string, number>,
): boolean {
  return Object.entries(cost).every(([k, v]) => (inventory[k] ?? 0) >= (v ?? 0));
}
