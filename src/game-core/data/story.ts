/**
 * Crónica: capítulos cortos (~20s) ligados a estructuras del campamento.
 * La historia AVANZA SOLO con disciplina (construir cuesta materiales = hábitos).
 * El texto vive en copies (game.story.<key>.{title,body}). Ver docs/design/08-world-spec.md.
 */
export interface StoryChapter {
  /** Coincide con la estructura que lo desbloquea ('tent' = prólogo, siempre). */
  key: string;
  order: number;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  { key: 'tent', order: 0 },
  { key: 'campfire', order: 1 },
  { key: 'house', order: 2 },
  { key: 'grove', order: 3 },
  { key: 'workshop', order: 4 },
  { key: 'stable', order: 5 },
  { key: 'gardens', order: 6 },
  { key: 'fountain', order: 7 },
  { key: 'library', order: 8 },
  { key: 'gym', order: 9 },
  { key: 'statues', order: 10 },
  { key: 'market', order: 11 },
];

/** Capítulos desbloqueados: el prólogo (tienda) + los de estructuras construidas. */
export function unlockedChapters(built: ReadonlySet<string>): StoryChapter[] {
  return STORY_CHAPTERS.filter((c) => c.key === 'tent' || built.has(c.key));
}

/** ¿La estructura recién construida tiene un capítulo de historia? (siempre, salvo la tienda inicial) */
export function chapterForStructure(structureKey: string): StoryChapter | null {
  return STORY_CHAPTERS.find((c) => c.key === structureKey && c.key !== 'tent') ?? null;
}
