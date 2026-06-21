/**
 * Hero titles — earned badges that display next to the hero name.
 * Each title has an unlock condition checked against AchievementStats + level.
 */
import type { AchievementStats } from '../types';

export interface TitleDef {
  key: string;
  /** i18n key (under achievements.titles.${key}) */
  nameKey: string;
  /** Unlock condition */
  check: (stats: AchievementStats) => boolean;
}

export const TITLES: TitleDef[] = [
  // ── Racha ─────────────────────────────────────────────────────────────────
  { key: 'persistent',   nameKey: 'titles.persistent',   check: (s) => s.longestStreak >= 7 },
  { key: 'relentless',   nameKey: 'titles.relentless',   check: (s) => s.longestStreak >= 21 },
  { key: 'iron_will',    nameKey: 'titles.iron_will',    check: (s) => s.longestStreak >= 30 },
  { key: 'unbreakable',  nameKey: 'titles.unbreakable',  check: (s) => s.longestStreak >= 50 },
  { key: 'centurion',    nameKey: 'titles.centurion',    check: (s) => s.longestStreak >= 100 },
  { key: 'legend',       nameKey: 'titles.legend',       check: (s) => s.longestStreak >= 365 },
  // ── Sin alcohol ───────────────────────────────────────────────────────────
  { key: 'clean',        nameKey: 'titles.clean',        check: (s) => s.alcoholFreeDays >= 7 },
  { key: 'sober_mind',   nameKey: 'titles.sober_mind',   check: (s) => s.alcoholFreeDays >= 30 },
  { key: 'free',         nameKey: 'titles.free',         check: (s) => s.alcoholFreeDays >= 100 },
  // ── Nivel ─────────────────────────────────────────────────────────────────
  { key: 'warrior',      nameKey: 'titles.warrior',      check: (s) => s.level >= 10 },
  { key: 'veteran',      nameKey: 'titles.veteran',      check: (s) => s.level >= 25 },
  { key: 'hero',         nameKey: 'titles.hero',         check: (s) => s.level >= 50 },
  // ── Especiales ────────────────────────────────────────────────────────────
  { key: 'scholar',      nameKey: 'titles.scholar',      check: (s) => s.reads >= 100 },
  { key: 'conqueror',    nameKey: 'titles.conqueror',    check: (s) => s.seasonsCompleted >= 2 },
  { key: 'ascendant',    nameKey: 'titles.ascendant',    check: (s) => s.seasonsCompleted >= 4 },
];

export const TITLES_BY_KEY: Record<string, TitleDef> = Object.fromEntries(
  TITLES.map((t) => [t.key, t]),
);

export function evaluateTitles(stats: AchievementStats): string[] {
  return TITLES.filter((t) => t.check(stats)).map((t) => t.key);
}
