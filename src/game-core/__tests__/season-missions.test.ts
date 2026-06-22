import { describe, it, expect } from 'vitest';
import { SEASON_1_RESET } from '../data/seasons';
import {
  createSeasonProgress,
  advanceSeasonDay,
  zoneForDay,
  seasonProgressPct,
} from '../season/season';
import {
  generateDailyMissions,
  allMissionsComplete,
} from '../missions/missions';
import { attributePointsForHabit, attributeRank } from '../attributes/attributes';
import { HABITS } from '../data/habits';

describe('progreso de temporada (por días cumplidos)', () => {
  it('se completa al alcanzar la duración, no por calendario', () => {
    let p = createSeasonProgress(SEASON_1_RESET);
    expect(p.completed).toBe(false);
    for (let i = 0; i < 20; i++) p = advanceSeasonDay(p, SEASON_1_RESET);
    expect(p.daysCompleted).toBe(20);
    expect(p.completed).toBe(false);
    p = advanceSeasonDay(p, SEASON_1_RESET); // día 21
    expect(p.completed).toBe(true);
  });

  it('no avanza más allá una vez completada', () => {
    let p = { seasonKey: 's1-reset', daysCompleted: 21, completed: true };
    p = advanceSeasonDay(p, SEASON_1_RESET);
    expect(p.daysCompleted).toBe(21);
  });

  it('mapea día → zona del mapa', () => {
    expect(zoneForDay(SEASON_1_RESET, 1).key).toBe('forest');
    expect(zoneForDay(SEASON_1_RESET, 5).key).toBe('mountain');
    expect(zoneForDay(SEASON_1_RESET, 21).key).toBe('summit');
  });

  it('seasonProgressPct entre 0 y 1', () => {
    const p = { seasonKey: 's1-reset', daysCompleted: 10, completed: false };
    expect(seasonProgressPct(p, SEASON_1_RESET)).toBeCloseTo(10 / 21);
  });
});

describe('generación de misiones diarias', () => {
  const active = ['no_alcohol', 'train', 'sleep', 'water', 'steps'] as const;

  it('la principal es el hábito foco de la temporada (train)', () => {
    const m = generateDailyMissions(SEASON_1_RESET, [...active]);
    expect(m.main.habit).toBe('train');
    expect(m.main.kind).toBe('main');
    expect(m.secondary).toHaveLength(4);
    expect(m.secondary.some((s) => s.habit === 'train')).toBe(false);
  });

  it('Mission Complete requiere TODAS las misiones', () => {
    const m = generateDailyMissions(SEASON_1_RESET, [...active]);
    const partial = new Set(['train', 'no_alcohol'] as const);
    expect(allMissionsComplete(m, partial)).toBe(false);
    const all = new Set([...active]);
    expect(allMissionsComplete(m, all)).toBe(true);
  });

  it('lanza si no hay hábitos activos', () => {
    expect(() => generateDailyMissions(SEASON_1_RESET, [])).toThrow();
  });

  const active8 = [
    'no_alcohol', 'train', 'sleep', 'water', 'steps', 'eat_well', 'read', 'meditate',
  ] as const;

  it('con seed: principal + ancla fija + 2 rotativas', () => {
    const m = generateDailyMissions(SEASON_1_RESET, [...active8], 'u:2026-06-19');
    expect(m.main.habit).toBe('train');
    const keys = m.secondary.map((s) => s.habit);
    expect(keys).toContain('no_alcohol'); // ancla siempre presente
    expect(m.secondary).toHaveLength(3); // ancla + 2 rotativas
  });

  it('es determinista por seed (mismo día → mismo set)', () => {
    const a = generateDailyMissions(SEASON_1_RESET, [...active8], 'u:2026-06-19').secondary.map((s) => s.habit);
    const b = generateDailyMissions(SEASON_1_RESET, [...active8], 'u:2026-06-19').secondary.map((s) => s.habit);
    expect(a).toEqual(b);
  });

  it('rota entre días (no siempre lo mismo)', () => {
    const combos = new Set<string>();
    for (let d = 1; d <= 14; d++) {
      const keys = generateDailyMissions(SEASON_1_RESET, [...active8], `u:2026-06-${d}`)
        .secondary.map((s) => s.habit).sort().join(',');
      combos.add(keys);
    }
    expect(combos.size).toBeGreaterThan(1);
  });
});

describe('atributos', () => {
  it('puntos por acción = floor(XP_base / 10)', () => {
    expect(attributePointsForHabit(HABITS.train)).toBe(15);
    expect(attributePointsForHabit(HABITS.no_alcohol)).toBe(12);
  });

  it('rango sube cada 100 puntos, empezando en I (1)', () => {
    expect(attributeRank(0)).toBe(1);
    expect(attributeRank(99)).toBe(1);
    expect(attributeRank(100)).toBe(2);
    expect(attributeRank(250)).toBe(3);
  });
});
