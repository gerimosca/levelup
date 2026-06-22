import { describe, it, expect } from 'vitest';
import {
  selectDailyEvent,
  eligibleEvents,
  eventMultiplierForHabit,
  eventEnemyMultiplier,
} from '../events/events';
import { seededUnit } from '../lib/seeded-random';
import { evaluateAchievements } from '../achievements/achievements';
import type { AchievementStats, DailyEventContext } from '../types';

const baseCtx: DailyEventContext = {
  isWeekend: false,
  hadRelapseYesterday: false,
  activeHabits: [],
  currentStreak: 0,
};

describe('aleatoriedad sembrada (determinista)', () => {
  it('mismo seed → mismo valor', () => {
    expect(seededUnit('user-1:2026-06-18')).toBe(seededUnit('user-1:2026-06-18'));
  });
  it('seeds distintos → valores distintos', () => {
    expect(seededUnit('a')).not.toBe(seededUnit('b'));
  });
  it('siempre en [0, 1)', () => {
    for (const s of ['x', 'y', 'z', 'user:date', '123']) {
      const v = seededUnit(s);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('eventos diarios', () => {
  it('excluye eventos de finde entre semana', () => {
    const weekday = eligibleEvents({ ...baseCtx, activeHabits: ['no_alcohol'] });
    expect(weekday.some((e) => e.key === 'weekend_temptation')).toBe(false);
  });

  it('incluye revancha solo tras una recaída', () => {
    const noRelapse = eligibleEvents(baseCtx);
    const afterRelapse = eligibleEvents({ ...baseCtx, hadRelapseYesterday: true });
    expect(noRelapse.some((e) => e.key === 'rematch_day')).toBe(false);
    expect(afterRelapse.some((e) => e.key === 'rematch_day')).toBe(true);
  });

  it('excluye eventos de hábito cuando ese hábito no está activo', () => {
    const noHabits = eligibleEvents(baseCtx);
    expect(noHabits.some((e) => e.key === 'rainy_day')).toBe(false);
    const withTrain = eligibleEvents({ ...baseCtx, activeHabits: ['train'] });
    expect(withTrain.some((e) => e.key === 'rainy_day')).toBe(true);
  });

  it('excluye momentum cuando la racha es baja', () => {
    const shortStreak = eligibleEvents({ ...baseCtx, currentStreak: 3 });
    expect(shortStreak.some((e) => e.key === 'momentum')).toBe(false);
    const longStreak = eligibleEvents({ ...baseCtx, currentStreak: 5 });
    expect(longStreak.some((e) => e.key === 'momentum')).toBe(true);
  });

  it('selectDailyEvent es determinista por seed', () => {
    expect(selectDailyEvent('u:d', baseCtx).key).toBe(selectDailyEvent('u:d', baseCtx).key);
  });

  it('el multiplicador solo aplica al objetivo del evento', () => {
    const rainy = { key: 'rainy_day', multiplier: 2, target: { kind: 'habit', habit: 'train' }, weight: 1 } as const;
    expect(eventMultiplierForHabit(rainy, 'train')).toBe(2);
    expect(eventMultiplierForHabit(rainy, 'read')).toBe(1);
    const golden = { key: 'golden_day', multiplier: 1.5, target: { kind: 'all' }, weight: 1 } as const;
    expect(eventMultiplierForHabit(golden, 'read')).toBe(1.5);
    const rematch = { key: 'rematch_day', multiplier: 2, target: { kind: 'enemy' }, weight: 1 } as const;
    expect(eventEnemyMultiplier(rematch)).toBe(2);
    expect(eventMultiplierForHabit(rematch, 'train')).toBe(1);
  });
});

describe('logros', () => {
  const base: AchievementStats = {
    level: 1,
    trainings: 0,
    alcoholFreeDays: 0,
    kmWalked: 0,
    reads: 0,
    longestStreak: 0,
    seasonsCompleted: 0,
    perfectWeeks: 0,
    attributeRanks: {},
  };

  it('desbloquea los que cumplen y no estaban ya desbloqueados', () => {
    const stats = { ...base, trainings: 1, alcoholFreeDays: 1, longestStreak: 7 };
    const newly = evaluateAchievements(stats, new Set());
    expect(newly).toContain('first_training');
    expect(newly).toContain('first_clean_day');
    expect(newly).toContain('streak_7');
    expect(newly).not.toContain('streak_30');
  });

  it('no repite logros ya desbloqueados', () => {
    const stats = { ...base, trainings: 1 };
    const newly = evaluateAchievements(stats, new Set(['first_training']));
    expect(newly).not.toContain('first_training');
  });
});
