/**
 * season — Progreso de temporada por DÍAS CUMPLIDOS (no calendario) y mapa.
 * Decisión clave: faltar un día retrasa pero NUNCA "pierde" la temporada.
 * Ver docs/design/02-game-design.md §11, §12.
 */
import type { SeasonDef, SeasonProgress, ZoneDef } from '../types';

export function createSeasonProgress(season: SeasonDef): SeasonProgress {
  return { seasonKey: season.key, daysCompleted: 0, completed: false };
}

/** Zona del mapa para un día (1-based) de la temporada. */
export function zoneForDay(season: SeasonDef, day: number): ZoneDef {
  let current = season.zones[0];
  for (const zone of season.zones) {
    if (day >= zone.startDay) current = zone;
  }
  return current;
}

/** Avanza un día cumplido. Marca completada al alcanzar la duración. */
export function advanceSeasonDay(
  progress: SeasonProgress,
  season: SeasonDef,
): SeasonProgress {
  if (progress.completed) return progress;
  const daysCompleted = progress.daysCompleted + 1;
  return {
    ...progress,
    daysCompleted,
    completed: daysCompleted >= season.durationDays,
  };
}

export function seasonProgressPct(
  progress: SeasonProgress,
  season: SeasonDef,
): number {
  return Math.min(1, progress.daysCompleted / season.durationDays);
}
