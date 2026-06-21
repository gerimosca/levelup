/**
 * events — Selección determinista del evento diario y sus multiplicadores.
 * Ver docs/design/02-game-design.md §9.
 */
import type { DailyEventContext, EventDef, HabitKey } from '../types';
import { EVENTS } from '../data/events';
import { pickWeighted } from '../lib/seeded-random';

/** Eventos válidos según el contexto del día (finde, recaída previa, hábitos activos, racha). */
export function eligibleEvents(ctx: DailyEventContext): EventDef[] {
  return EVENTS.filter((e) => {
    if (e.onlyWeekend && !ctx.isWeekend) return false;
    if (e.onlyAfterRelapse && !ctx.hadRelapseYesterday) return false;
    if (e.onlyAfterStreak !== undefined && ctx.currentStreak < e.onlyAfterStreak) return false;
    // Eventos de hábito solo aplican si el usuario trabaja ese hábito hoy
    if (e.target.kind === 'habit' && !ctx.activeHabits.includes(e.target.habit)) return false;
    return true;
  });
}

/** Evento del día: determinista por seed (`${userId}:${date}`). */
export function selectDailyEvent(seed: string, ctx: DailyEventContext): EventDef {
  const pool = eligibleEvents(ctx);
  return pickWeighted(seed, pool, (e) => e.weight);
}

/** Multiplicador del evento aplicable al XP de un hábito concreto (1 si no aplica). */
export function eventMultiplierForHabit(event: EventDef, habit: HabitKey): number {
  if (event.target.kind === 'all') return event.multiplier;
  if (event.target.kind === 'habit' && event.target.habit === habit) {
    return event.multiplier;
  }
  return 1;
}

/** Multiplicador del evento aplicable al daño contra el enemigo (1 si no aplica). */
export function eventEnemyMultiplier(event: EventDef): number {
  return event.target.kind === 'enemy' ? event.multiplier : 1;
}
