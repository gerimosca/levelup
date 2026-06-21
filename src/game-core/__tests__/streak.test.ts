import { describe, it, expect } from 'vitest';
import { streakMultiplier, nextStreak } from '../streak/streak';

describe('streakMultiplier', () => {
  it('aplica los tramos del bonus de racha', () => {
    expect(streakMultiplier(0)).toBe(1.0);
    expect(streakMultiplier(2)).toBe(1.0);
    expect(streakMultiplier(3)).toBe(1.05);
    expect(streakMultiplier(7)).toBe(1.1);
    expect(streakMultiplier(14)).toBe(1.15);
    expect(streakMultiplier(30)).toBe(1.2);
    expect(streakMultiplier(100)).toBe(1.25);
    expect(streakMultiplier(500)).toBe(1.25); // cap
  });
});

describe('nextStreak', () => {
  it('suma 1 en día consecutivo', () => {
    expect(nextStreak(6, 1)).toBe(7);
  });

  it('no cuenta dos veces el mismo día', () => {
    expect(nextStreak(6, 0)).toBe(6);
  });

  it('reinicia a 1 tras un hueco', () => {
    expect(nextStreak(20, 2)).toBe(1);
    expect(nextStreak(20, 5)).toBe(1);
  });
});
