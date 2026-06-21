/**
 * NPCs del campamento. Cada uno llega al construir su estructura y te suelta
 * frases cortas que reaccionan a tu progreso. Ver docs/design/08-world-spec.md §1.
 */
import { seededUnit } from '../lib/seeded-random';

export interface NpcDef {
  key: string;
  /** Estructura que lo trae al campamento. */
  structure: string;
  /** Nº de frases disponibles (en copies: npcLines.<key>.0..n-1). */
  lineCount: number;
}

export const NPCS: NpcDef[] = [
  { key: 'elder', structure: 'campfire', lineCount: 3 },
  { key: 'explorer', structure: 'grove', lineCount: 3 },
  { key: 'blacksmith', structure: 'workshop', lineCount: 3 },
  { key: 'librarian', structure: 'library', lineCount: 3 },
  { key: 'trainer', structure: 'gym', lineCount: 3 },
  { key: 'cook', structure: 'market', lineCount: 3 },
];

export const NPC_BY_STRUCTURE: Record<string, NpcDef> = Object.fromEntries(
  NPCS.map((n) => [n.structure, n]),
);

/** NPCs presentes (los de estructuras ya construidas). */
export function presentNpcs(built: ReadonlySet<string>): NpcDef[] {
  return NPCS.filter((n) => built.has(n.structure));
}

/**
 * Saludo del día: elige un NPC presente y una de sus frases, determinista por
 * seed (`userId:fecha`) → cambia cada día, igual en todos los dispositivos.
 */
export function pickNpcGreeting(
  built: ReadonlySet<string>,
  seed: string,
): { key: string; lineIdx: number } | null {
  const present = presentNpcs(built);
  if (present.length === 0) return null;
  const npc = present[Math.floor(seededUnit(`${seed}:npc`) * present.length)];
  const lineIdx = Math.floor(seededUnit(`${seed}:${npc.key}`) * npc.lineCount);
  return { key: npc.key, lineIdx };
}
