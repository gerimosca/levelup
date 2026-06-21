/**
 * seeded-random — aleatoriedad DETERMINISTA a partir de una semilla string.
 *
 * El motor no usa Math.random (rompería la reproducibilidad y los tests, y
 * evita que el evento del día cambie entre dispositivos). Mismo seed → mismo
 * resultado. El seed típico es `${userId}:${dayDate}`.
 */

/** Float determinista en [0, 1) a partir de un string. */
export function seededUnit(seed: string): number {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // mezcla final estilo mulberry32
  h += 0x6d2b79f5;
  let t = h;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Elige un elemento de forma ponderada y determinista según el seed. */
export function pickWeighted<T>(
  seed: string,
  items: T[],
  weight: (item: T) => number,
): T {
  if (items.length === 0) {
    throw new Error('pickWeighted: la lista de items está vacía');
  }
  const total = items.reduce((sum, i) => sum + Math.max(0, weight(i)), 0);
  if (total <= 0) return items[0];
  let r = seededUnit(seed) * total;
  for (const item of items) {
    r -= Math.max(0, weight(item));
    if (r < 0) return item;
  }
  return items[items.length - 1];
}
