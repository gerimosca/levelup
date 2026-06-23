import { describe, it, expect } from 'vitest';
import { HABITS, HABIT_LIST } from '../data/habits';
import { penaltyForHabit, applyDailyDecay } from '../xp/penalty';
import { levelFromTotalXp } from '../leveling/leveling';
import { cumulativeXpForLevel } from '../data/levels';

describe('penaltyForHabit', () => {
  it('resta un cuarto del XP base (redondeado)', () => {
    expect(penaltyForHabit(HABITS.train)).toBe(38);       // 150 * 0.25
    expect(penaltyForHabit(HABITS.no_alcohol)).toBe(38);  // 150 * 0.25 (rebalanceado)
    expect(penaltyForHabit(HABITS.sleep)).toBe(25);       // 100 * 0.25
    expect(penaltyForHabit(HABITS.steps)).toBe(21);       // 85 * 0.25
    expect(penaltyForHabit(HABITS.meditate)).toBe(18);    // 72 * 0.25
  });

  it('el peor día (todos los hábitos fallados) suma el total de HABIT_LIST', () => {
    const total = HABIT_LIST.reduce((s, h) => s + penaltyForHabit(h), 0);
    // 16 hábitos rebalanceados: total = 380
    expect(total).toBe(380);
  });
});

describe('applyDailyDecay — red de seguridad (NUNCA bajar de nivel)', () => {
  it('aplica la penalización completa cuando hay margen sobre el suelo', () => {
    const xp = 2000; // nivel 4 (suelo cumulativeXpForLevel(4) = 1072)
    const result = applyDailyDecay(xp, [HABITS.train, HABITS.no_alcohol]); // 38 + 38 = 76
    expect(result.rawPenalty).toBe(76);
    expect(result.newXpTotal).toBe(1924);
    expect(result.xpLost).toBe(76);
    expect(levelFromTotalXp(result.newXpTotal).level).toBe(4); // sigue en nivel 4
  });

  it('el XP nunca baja del umbral del nivel actual (suelo duro)', () => {
    const xp = 150; // nivel 2 (suelo = cumulativeXpForLevel(2) = 100)
    const before = levelFromTotalXp(xp).level;
    const result = applyDailyDecay(xp, [...HABIT_LIST]); // penalización masiva (380)
    expect(result.newXpTotal).toBe(cumulativeXpForLevel(before)); // clavado al suelo
    expect(result.newXpTotal).toBe(100);
    expect(result.xpLost).toBe(50); // solo pierde hasta el suelo, no 380
    expect(levelFromTotalXp(result.newXpTotal).level).toBe(before); // NO baja de nivel
  });

  it('sin hábitos fallados no hay penalización', () => {
    const result = applyDailyDecay(500, []);
    expect(result.rawPenalty).toBe(0);
    expect(result.xpLost).toBe(0);
    expect(result.newXpTotal).toBe(500);
  });
});
