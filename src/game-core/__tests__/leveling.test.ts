import { describe, it, expect } from 'vitest';
import { xpToNext, cumulativeXpForLevel } from '../data/levels';
import { levelFromTotalXp, tierForLevel } from '../leveling/leveling';

describe('curva de niveles', () => {
  it('xpToNext sigue round(100 * L^1.7)', () => {
    expect(xpToNext(1)).toBe(100);
    expect(xpToNext(2)).toBe(325);
    expect(xpToNext(3)).toBe(647);
    expect(xpToNext(4)).toBe(1056);
    expect(xpToNext(5)).toBe(1543);
    expect(xpToNext(9)).toBe(4190);
    expect(xpToNext(10)).toBe(5012);
  });

  it('nivel 10 requiere ~16.127 XP acumulada (curva exigente)', () => {
    expect(cumulativeXpForLevel(10)).toBe(16127);
  });

  it('nivel 1 no requiere XP previa', () => {
    expect(cumulativeXpForLevel(1)).toBe(0);
  });
});

describe('levelFromTotalXp', () => {
  it('empieza en nivel 1 con 0 XP', () => {
    const info = levelFromTotalXp(0);
    expect(info.level).toBe(1);
    expect(info.xpIntoLevel).toBe(0);
    expect(info.tier).toBe('initiate');
  });

  it('16.127 XP = exactamente nivel 10', () => {
    const info = levelFromTotalXp(16127);
    expect(info.level).toBe(10);
    expect(info.xpIntoLevel).toBe(0);
    expect(info.tier).toBe('warrior');
  });

  it('1 XP antes del nivel 10 sigue siendo nivel 9', () => {
    expect(levelFromTotalXp(16126).level).toBe(9);
  });

  it('progress queda entre 0 y 1', () => {
    const info = levelFromTotalXp(300);
    expect(info.progress).toBeGreaterThanOrEqual(0);
    expect(info.progress).toBeLessThan(1);
  });
});

describe('tierForLevel', () => {
  it('mapea los umbrales de tier', () => {
    expect(tierForLevel(1)).toBe('initiate');
    expect(tierForLevel(4)).toBe('initiate');
    expect(tierForLevel(5)).toBe('apprentice');
    expect(tierForLevel(10)).toBe('warrior');
    expect(tierForLevel(20)).toBe('veteran');
    expect(tierForLevel(35)).toBe('hero');
    expect(tierForLevel(50)).toBe('legend');
    expect(tierForLevel(120)).toBe('legend');
  });
});
