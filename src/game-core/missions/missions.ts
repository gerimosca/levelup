/**
 * missions — Generación de las misiones del día y cierre "Mission Complete".
 * Ver docs/design/02-game-design.md §10.
 */
import type { DailyMissions, HabitKey, Mission, SeasonDef } from '../types';
import { getHabit } from '../data/habits';
import { seededUnit } from '../lib/seeded-random';

/** Bonus de XP al cerrar TODAS las misiones del día. */
export const MISSION_COMPLETE_BONUS = 80;

/** Cuántas secundarias ROTATIVAS se eligen cada día (además de las ancla). */
export const ROTATING_MISSIONS_PER_DAY = 4;

/** Coste en 'wood' para hacer reroll de una misión secundaria. */
export const MISSION_REROLL_COST = 2;

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
 * Aplica overrides de reroll sobre un set de misiones generado.
 * `overrides` es un mapa { originalHabit: replacementHabit }.
 * Si el original ya no está en las misiones (fue reemplazado antes), se ignora.
 */
export function applyMissionOverrides(
  missions: DailyMissions,
  overrides: Partial<Record<string, HabitKey>>,
): DailyMissions {
  if (Object.keys(overrides).length === 0) return missions;
  const secondary = missions.secondary.map((m) => {
    const replacement = overrides[m.habit];
    if (!replacement) return m;
    return { ...m, habit: replacement, xp: getHabit(replacement).baseXp };
  });
  return { ...missions, secondary };
}

/**
 * Elige un hábito de reemplazo para `habitToReplace` desde la pool de activos
 * que aún no están en misiones. Devuelve null si no hay alternativas.
 * El resultado es determinista por `seed` para que sea consistente entre dispositivos.
 */
export function pickReplacementHabit(
  missions: DailyMissions,
  habitToReplace: HabitKey,
  activeHabits: HabitKey[],
  seed: string,
): HabitKey | null {
  const usedHabits = new Set<HabitKey>([
    missions.main.habit,
    ...missions.secondary.map((m) => m.habit),
  ]);
  // El habit a reemplazar queda libre para que no aparezca como opción
  usedHabits.delete(habitToReplace);

  const available = activeHabits.filter((h) => !usedHabits.has(h) && h !== habitToReplace);
  if (available.length === 0) return null;

  // Determinista por seed (mismo dispositivo, mismo resultado)
  const sorted = [...available].sort(
    (a, b) => seededUnit(`${seed}:reroll:${a}`) - seededUnit(`${seed}:reroll:${b}`),
  );
  return sorted[0] ?? null;
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
