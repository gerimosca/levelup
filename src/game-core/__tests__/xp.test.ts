import { describe, it, expect } from 'vitest';
import { HABITS, HABIT_LIST } from '../data/habits';
import { calculateHabitXp, applyMultipliers, calculateReward } from '../xp/calculateXp';

describe('XP de hábitos boolean', () => {
  it('entrenar da 150 si se hace, 0 si no', () => {
    expect(calculateHabitXp(HABITS.train, true)).toBe(150);
    expect(calculateHabitXp(HABITS.train, false)).toBe(0);
  });

  it('no beber alcohol da 120', () => {
    expect(calculateHabitXp(HABITS.no_alcohol, true)).toBe(120);
  });

  it('el máximo diario base de todos los hábitos es 820', () => {
    const max = HABIT_LIST.reduce((sum, h) => sum + h.baseXp, 0);
    expect(max).toBe(820);
  });
});

describe('XP de hábitos graduales (parcial)', () => {
  it('agua: 10 XP por cada 0,5 L, máx 40 a los 2 L', () => {
    expect(calculateHabitXp(HABITS.water, 0)).toBe(0);
    expect(calculateHabitXp(HABITS.water, 0.5)).toBe(10);
    expect(calculateHabitXp(HABITS.water, 1)).toBe(20);
    expect(calculateHabitXp(HABITS.water, 2)).toBe(40);
    expect(calculateHabitXp(HABITS.water, 3)).toBe(40); // cap
  });

  it('pasos: 7 XP por cada 1.000, máx 70 a los 10.000', () => {
    expect(calculateHabitXp(HABITS.steps, 7000)).toBe(49);
    expect(calculateHabitXp(HABITS.steps, 10000)).toBe(70);
  });

  it('pasos: bonus +20 superando 15.000', () => {
    expect(calculateHabitXp(HABITS.steps, 15000)).toBe(90);
  });

  it('sueño: 0 por debajo de 5h, full 80 a partir de 7h', () => {
    expect(calculateHabitXp(HABITS.sleep, 4)).toBe(0);
    expect(calculateHabitXp(HABITS.sleep, 5)).toBe(0);
    expect(calculateHabitXp(HABITS.sleep, 6)).toBe(40);
    expect(calculateHabitXp(HABITS.sleep, 7)).toBe(80);
    expect(calculateHabitXp(HABITS.sleep, 9)).toBe(80); // cap
  });
});

describe('multiplicadores', () => {
  it('evento x2 dobla el XP de la acción', () => {
    expect(applyMultipliers(120, { event: 2 })).toBe(240);
  });

  it('racha y evento se combinan', () => {
    // 150 * 3 (evento) * 1.1 (racha) = 495
    expect(applyMultipliers(150, { event: 3, streak: 1.1 })).toBe(495);
  });

  it('calculateReward encadena base + multiplicadores', () => {
    expect(calculateReward(HABITS.train, true, { event: 2, streak: 1.15 })).toBe(345);
  });
});
