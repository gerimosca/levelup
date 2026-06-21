/**
 * missions — Generación de las misiones del día y cierre "Mission Complete".
 * Ver docs/design/02-game-design.md §10.
 */
import type { DailyMissions, HabitKey, Mission, SeasonDef } from '../types';
import { getHabit } from '../data/habits';
import { seededUnit } from '../lib/seeded-random';

/** Bonus de XP al cerrar TODAS las misiones del día. */
export const MISSION_COMPLETE_BONUS = 50;

/** Cuántas secundarias ROTATIVAS se eligen cada día (además de las ancla). */
export const ROTATING_MISSIONS_PER_DAY = 2;

/**
 * Genera las misiones del día:
 * - 1 misión PRINCIPAL (el foco de la temporada, siempre).
 * - secundarias ANCLA (siempre cada día, p.ej. no beber).
 * - + N secundarias ROTATIVAS elegidas del resto, deterministas por `seed`
 *   (mismo set todo el día e igual en todos los dispositivos; cambia por día).
 *
 * Sin `seed` no rota (incluye todas) — útil para tests/preview.
 */
export function generateDailyMissions(
  season: SeasonDef,
  activeHabits: HabitKey[],
  seed = '',
): DailyMissions {
  if (activeHabits.length === 0) {
    throw new Error('generateDailyMissions: el usuario no tiene hábitos activos');
  }
  const mainHabit = activeHabits.includes(season.mainHabit)
    ? season.mainHabit
    : activeHabits[0];

  const remaining = activeHabits.filter((h) => h !== mainHabit);
  const anchors = remaining.filter((h) => season.anchorHabits.includes(h));
  const pool = remaining.filter((h) => !anchors.includes(h));

  let rotating: HabitKey[];
  if (!seed || pool.length <= ROTATING_MISSIONS_PER_DAY) {
    rotating = pool;
  } else {
    rotating = [...pool]
      .sort((a, b) => seededUnit(`${seed}:${a}`) - seededUnit(`${seed}:${b}`))
      .slice(0, ROTATING_MISSIONS_PER_DAY);
  }

  const chosen = new Set<HabitKey>([...anchors, ...rotating]);
  // Orden de visualización estable (según el orden de activeHabits).
  const secondary: Mission[] = activeHabits
    .filter((h) => h !== mainHabit && chosen.has(h))
    .map((h) => ({ habit: h, kind: 'secondary' as const, xp: getHabit(h).baseXp }));

  const main: Mission = {
    habit: mainHabit,
    kind: 'main',
    xp: getHabit(mainHabit).baseXp,
  };

  return { main, secondary };
}

/**
 * ¿Se han completado TODAS las misiones del día?
 * `completed` puede contener claves extra (p.ej. el bonus sintético); solo se
 * comprueban los hábitos de las misiones.
 */
export function allMissionsComplete(
  missions: DailyMissions,
  completed: ReadonlySet<string>,
): boolean {
  if (!completed.has(missions.main.habit)) return false;
  return missions.secondary.every((m) => completed.has(m.habit));
}
