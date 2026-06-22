import { describe, it, expect } from 'vitest';
import { SEASON_1_RESET } from '../data/seasons';
import {
  createEnemy,
  applyDayCompleted,
  applySetback,
  enemyHpPct,
  isEnemyDefeated,
} from '../enemy/enemy';

const cfg = SEASON_1_RESET.enemy;

describe('La Pereza (S1 enemy)', () => {
  it('arranca a HP máximo (2100)', () => {
    const e = createEnemy(cfg);
    expect(e.hpCurrent).toBe(2100);
    expect(e.hpMax).toBe(2100);
  });

  it('21 días entrenando la derrotan exactamente', () => {
    let e = createEnemy(cfg);
    for (let i = 0; i < 21; i++) e = applyDayCompleted(e, cfg);
    expect(e.hpCurrent).toBe(0);
    expect(isEnemyDefeated(e)).toBe(true);
  });

  it('un fallo le devuelve fuerza (+150) sin pasar de hpMax', () => {
    let e = createEnemy(cfg);
    e = applyDayCompleted(e, cfg); // 2000
    e = applySetback(e, cfg); // 2150 → cap 2100
    expect(e.hpCurrent).toBe(2100);
  });

  it('el daño nunca deja el HP por debajo de 0', () => {
    let e = { hpCurrent: 50, hpMax: 2100 };
    e = applyDayCompleted(e, cfg); // 50 - 100 → 0
    expect(e.hpCurrent).toBe(0);
  });

  it('el evento "día de revancha" duplica el daño', () => {
    const e = applyDayCompleted(createEnemy(cfg), cfg, 2);
    expect(e.hpCurrent).toBe(2100 - 200);
  });

  it('enemyHpPct refleja la proporción', () => {
    expect(enemyHpPct({ hpCurrent: 1050, hpMax: 2100 })).toBe(0.5);
  });
});
