/**
 * Catálogo de temporadas. Añadir una temporada = un archivo nuevo + entrada aquí
 * (Open/Closed). Ver docs/design/02-game-design.md §11.
 */
import type { SeasonDef } from '../../types';
import { SEASON_1_RESET } from './s1-reset';
import { SEASON_2_STRENGTH } from './s2-strength';
import { SEASON_3_CUT } from './s3-cut';
import { SEASON_4_DISCIPLINE } from './s4-discipline';

export const SEASONS: SeasonDef[] = [SEASON_1_RESET, SEASON_2_STRENGTH, SEASON_3_CUT, SEASON_4_DISCIPLINE];

export const SEASONS_BY_KEY: Record<string, SeasonDef> = Object.fromEntries(
  SEASONS.map((s) => [s.key, s]),
);

export function getSeason(key: string): SeasonDef | undefined {
  return SEASONS_BY_KEY[key];
}

/** Primera temporada (la que arranca un usuario nuevo). */
export const FIRST_SEASON = SEASONS.slice().sort((a, b) => a.order - b.order)[0];

/** Entrada del roadmap de temporadas (incluye las aún no jugables, para teaser). */
export interface SeasonRoadmapEntry {
  key: string;
  nameKey: string;
  durationDays: number;
  order: number;
  /** ¿Está implementada y se puede jugar? */
  playable: boolean;
}

/** Roadmap completo de temporadas (s1 jugable; s2-s4 teaser bloqueado). */
export const SEASON_ROADMAP: SeasonRoadmapEntry[] = [
  { key: 's1-reset', nameKey: 'season.s1.name', durationDays: 21, order: 1, playable: true },
  { key: 's2-strength', nameKey: 'season.s2.name', durationDays: 30, order: 2, playable: true },
  { key: 's3-cut', nameKey: 'season.s3.name', durationDays: 30, order: 3, playable: true },
  { key: 's4-discipline', nameKey: 'season.s4.name', durationDays: 60, order: 4, playable: true },
];

export { SEASON_1_RESET, SEASON_2_STRENGTH, SEASON_3_CUT, SEASON_4_DISCIPLINE };
