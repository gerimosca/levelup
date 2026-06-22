/**
 * Tests para temporadas S2-S4: enemigos, cofres y encadenamiento de temporadas.
 * S1 ya está cubierto en enemy.test.ts y season-missions.test.ts.
 */
import { describe, it, expect } from 'vitest';
import {
  SEASON_2_STRENGTH,
  SEASON_3_CUT,
  SEASON_4_DISCIPLINE,
  SEASON_1_RESET,
  SEASONS,
} from '../data/seasons';
import { CHEST_LOOT } from '../data/equipment';
import { createEnemy, applyDayCompleted, applySetback, isEnemyDefeated } from '../enemy/enemy';
import { zoneForDay, advanceSeasonDay, createSeasonProgress } from '../season/season';
import { generateDailyMissions } from '../missions/missions';

// ─── Enemigos S2-S4 ──────────────────────────────────────────────────────────

describe('S2 · Inercia (3000 HP, 30 días)', () => {
  const cfg = SEASON_2_STRENGTH.enemy;

  it('arranca a 3000 HP', () => {
    expect(createEnemy(cfg).hpCurrent).toBe(3000);
  });

  it('30 días completando el hábito principal lo derrotan exactamente', () => {
    let e = createEnemy(cfg);
    for (let i = 0; i < 30; i++) e = applyDayCompleted(e, cfg);
    expect(isEnemyDefeated(e)).toBe(true);
    expect(e.hpCurrent).toBe(0);
  });

  it('un fallo le devuelve fuerza (+200, cap a hpMax)', () => {
    let e = createEnemy(cfg);
    e = applyDayCompleted(e, cfg); // 3000 - 100 = 2900
    e = applySetback(e, cfg);      // 2900 + 200 = 3100 → cap 3000
    expect(e.hpCurrent).toBe(3000);
  });
});

describe('S3 · El Antojo (3000 HP, 30 días)', () => {
  const cfg = SEASON_3_CUT.enemy;

  it('arranca a 3000 HP', () => {
    expect(createEnemy(cfg).hpCurrent).toBe(3000);
  });

  it('30 días completando el hábito principal lo derrotan exactamente', () => {
    let e = createEnemy(cfg);
    for (let i = 0; i < 30; i++) e = applyDayCompleted(e, cfg);
    expect(isEnemyDefeated(e)).toBe(true);
  });

  it('mainHabit es eat_well, anchor es water', () => {
    expect(SEASON_3_CUT.mainHabit).toBe('eat_well');
    expect(SEASON_3_CUT.anchorHabits).toContain('water');
  });
});

describe('S4 · El Vacío (6000 HP, 60 días)', () => {
  const cfg = SEASON_4_DISCIPLINE.enemy;

  it('arranca a 6000 HP', () => {
    expect(createEnemy(cfg).hpCurrent).toBe(6000);
  });

  it('60 días completando el hábito principal lo derrotan exactamente', () => {
    let e = createEnemy(cfg);
    for (let i = 0; i < 60; i++) e = applyDayCompleted(e, cfg);
    expect(isEnemyDefeated(e)).toBe(true);
    expect(e.hpCurrent).toBe(0);
  });

  it('mainHabit es meditate, anchor es read', () => {
    expect(SEASON_4_DISCIPLINE.mainHabit).toBe('meditate');
    expect(SEASON_4_DISCIPLINE.anchorHabits).toContain('read');
  });
});

// ─── Zonas ───────────────────────────────────────────────────────────────────

describe('zonas por día', () => {
  it('S2: día 1 = plains, día 25 = glacier, día 30 = summit', () => {
    expect(zoneForDay(SEASON_2_STRENGTH, 1).key).toBe('plains');
    expect(zoneForDay(SEASON_2_STRENGTH, 25).key).toBe('glacier');
    expect(zoneForDay(SEASON_2_STRENGTH, 30).key).toBe('summit');
  });

  it('S3: día 1 = desert, día 30 = zenith', () => {
    expect(zoneForDay(SEASON_3_CUT, 1).key).toBe('desert');
    expect(zoneForDay(SEASON_3_CUT, 30).key).toBe('zenith');
  });

  it('S4: día 1 = sanctum, día 50 = astral, día 60 = transcendence', () => {
    expect(zoneForDay(SEASON_4_DISCIPLINE, 1).key).toBe('sanctum');
    expect(zoneForDay(SEASON_4_DISCIPLINE, 50).key).toBe('astral');
    expect(zoneForDay(SEASON_4_DISCIPLINE, 60).key).toBe('transcendence');
  });
});

// ─── Cofres ──────────────────────────────────────────────────────────────────

function chestDaysFor(season: typeof SEASON_4_DISCIPLINE) {
  const bossDay = season.durationDays;
  return season.zones
    .map((z, i) => (season.zones[i + 1] ? season.zones[i + 1].startDay : bossDay + 1) - 1)
    .filter((d) => d > 0 && d < bossDay);
}

const CHEST_OFFSET: Record<string, number> = {
  's1-reset': 0,
  's2-strength': 7,
  's3-cut': 13,
  's4-discipline': 19,
};

describe('cofres de temporada — sin índices fuera de rango', () => {
  const seasons = [SEASON_1_RESET, SEASON_2_STRENGTH, SEASON_3_CUT, SEASON_4_DISCIPLINE];

  for (const season of seasons) {
    it(`${season.key}: todos los cofres resuelven a un item válido`, () => {
      const days = chestDaysFor(season);
      const offset = CHEST_OFFSET[season.key] ?? 0;
      days.forEach((day, idx) => {
        const item = CHEST_LOOT[offset + idx];
        expect(item, `cofre día ${day} (idx ${idx}) sin item`).toBeDefined();
        expect(item.key).toBeTruthy();
      });
    });
  }

  it('S4 tiene exactamente 7 cofres (8 zonas - 1 boss)', () => {
    expect(chestDaysFor(SEASON_4_DISCIPLINE)).toHaveLength(7);
  });

  it('S4 cofre día 59 (astral→transcendence) existe', () => {
    const days = chestDaysFor(SEASON_4_DISCIPLINE);
    expect(days).toContain(59);
    const idx = days.indexOf(59);
    const item = CHEST_LOOT[CHEST_OFFSET['s4-discipline'] + idx];
    expect(item).toBeDefined();
    expect(item.key).toBe('transcendence_sash');
    expect(item.rarity).toBe('mythic');
  });
});

// ─── Encadenamiento S1 → S2 → S3 → S4 ──────────────────────────────────────

describe('SEASONS ordenadas y encadenadas', () => {
  it('hay exactamente 4 temporadas en orden 1-4', () => {
    const sorted = [...SEASONS].sort((a, b) => a.order - b.order);
    expect(sorted.map((s) => s.order)).toEqual([1, 2, 3, 4]);
    expect(sorted.map((s) => s.key)).toEqual([
      's1-reset', 's2-strength', 's3-cut', 's4-discipline',
    ]);
  });

  it('la siguiente temporada después de S1 es S2', () => {
    const s1 = SEASONS.find((s) => s.key === 's1-reset')!;
    const next = SEASONS.filter((s) => s.order > s1.order).sort((a, b) => a.order - b.order)[0];
    expect(next?.key).toBe('s2-strength');
  });

  it('después de S4 no hay siguiente', () => {
    const s4 = SEASONS.find((s) => s.key === 's4-discipline')!;
    const next = SEASONS.filter((s) => s.order > s4.order)[0];
    expect(next).toBeUndefined();
  });
});

// ─── Misiones por temporada ───────────────────────────────────────────────────

describe('misiones según temporada activa', () => {
  const all8 = ['no_alcohol', 'train', 'sleep', 'water', 'steps', 'eat_well', 'read', 'meditate'] as const;

  it('S2: principal = train, anchor = eat_well siempre presente', () => {
    const m = generateDailyMissions(SEASON_2_STRENGTH, [...all8], 'seed');
    expect(m.main.habit).toBe('train');
    expect(m.secondary.some((s) => s.habit === 'eat_well')).toBe(true);
  });

  it('S3: principal = eat_well, anchor = water siempre presente', () => {
    const m = generateDailyMissions(SEASON_3_CUT, [...all8], 'seed');
    expect(m.main.habit).toBe('eat_well');
    expect(m.secondary.some((s) => s.habit === 'water')).toBe(true);
  });

  it('S4: principal = meditate, anchor = read siempre presente', () => {
    const m = generateDailyMissions(SEASON_4_DISCIPLINE, [...all8], 'seed');
    expect(m.main.habit).toBe('meditate');
    expect(m.secondary.some((s) => s.habit === 'read')).toBe(true);
  });
});

// ─── Completar S2/S3/S4 ──────────────────────────────────────────────────────

describe('completar temporada al llegar a durationDays', () => {
  it('S2 completa en día 30', () => {
    let p = createSeasonProgress(SEASON_2_STRENGTH);
    for (let i = 0; i < 30; i++) p = advanceSeasonDay(p, SEASON_2_STRENGTH);
    expect(p.completed).toBe(true);
    expect(p.daysCompleted).toBe(30);
  });

  it('S4 completa en día 60', () => {
    let p = createSeasonProgress(SEASON_4_DISCIPLINE);
    for (let i = 0; i < 60; i++) p = advanceSeasonDay(p, SEASON_4_DISCIPLINE);
    expect(p.completed).toBe(true);
    expect(p.daysCompleted).toBe(60);
  });

  it('S4 no avanza más allá de 60', () => {
    let p = { seasonKey: 's4-discipline', daysCompleted: 60, completed: true };
    p = advanceSeasonDay(p, SEASON_4_DISCIPLINE);
    expect(p.daysCompleted).toBe(60);
  });
});
