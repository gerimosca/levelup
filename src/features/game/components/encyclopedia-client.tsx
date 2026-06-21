'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock } from 'lucide-react';
import {
  DISCOVERIES,
  DISCOVERY_CATEGORIES,
  RARITY,
  STORY_CHAPTERS,
  unlockedChapters,
  type RarityKey,
} from '@/game-core';
import { getEncyclopediaAction } from '../game.actions';

type CategoryFilter = (typeof DISCOVERY_CATEGORIES)[number] | 'all';

export function EncyclopediaClient() {
  const te = useTranslations('encyclopedia');
  const tg = useTranslations('game');
  const [data, setData] = useState<{ found: Set<string>; built: Set<string> } | null>(null);
  const [tab, setTab] = useState<'story' | 'discoveries'>('story');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    getEncyclopediaAction().then(({ found, built }) =>
      setData({ found: new Set(found), built: new Set(built) }),
    );
  }, []);

  if (!data) {
    return <p className="py-24 text-center text-sm text-muted-foreground">{te('loading')}</p>;
  }

  const total = DISCOVERIES.length;
  const got = DISCOVERIES.filter((d) => data.found.has(d.key)).length;
  const pct = total > 0 ? Math.round((got / total) * 100) : 0;
  const unlocked = new Set(unlockedChapters(data.built).map((c) => c.key));

  const tabBtn = (active: boolean) =>
    `flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
    }`;

  const visibleDiscoveries =
    catFilter === 'all'
      ? DISCOVERIES
      : DISCOVERIES.filter((d) => d.category === catFilter);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">{te('title')}</h1>

      <div className="flex gap-1 rounded-full border border-border bg-card p-1">
        <button type="button" onClick={() => setTab('story')} className={tabBtn(tab === 'story')}>
          {te('tabStory')}
        </button>
        <button
          type="button"
          onClick={() => setTab('discoveries')}
          className={tabBtn(tab === 'discoveries')}
        >
          {te('tabDiscoveries')}
        </button>
      </div>

      {tab === 'story' ? (
        <div className="space-y-3">
          {STORY_CHAPTERS.map((c, i) =>
            unlocked.has(c.key) ? (
              <article key={c.key} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {i === 0 ? te('prologue') : te('chapterLabel', { n: i })}
                </p>
                <h2 className="mt-0.5 font-bold">{tg(`story.${c.key}.title`)}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {tg(`story.${c.key}.body`)}
                </p>
              </article>
            ) : (
              <div
                key={c.key}
                className="flex items-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground"
              >
                <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                {te('chapterLocked', { structure: tg(`structures.${c.key}`) })}
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Progreso global */}
          <div>
            <p className="text-sm text-muted-foreground">{te('progress', { found: got, total })}</p>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Filtros de categoría */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {(['all', ...DISCOVERY_CATEGORIES] as CategoryFilter[]).map((cat) => {
              const catTotal =
                cat === 'all' ? total : DISCOVERIES.filter((d) => d.category === cat).length;
              const catFound =
                cat === 'all'
                  ? got
                  : DISCOVERIES.filter((d) => d.category === cat && data.found.has(d.key)).length;
              const active = catFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatFilter(cat)}
                  className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    borderColor: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    backgroundColor: active ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                    color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {cat === 'all' ? te('filterAll') : tg(`discoveryCategory.${cat}`)}
                  <span className="ml-1 opacity-60">{catFound}/{catTotal}</span>
                </button>
              );
            })}
          </div>

          {/* Grid de descubrimientos (filtrado) */}
          <div className="grid grid-cols-3 gap-2">
            {visibleDiscoveries.map((d) => {
              const isFound = data.found.has(d.key);
              const r = RARITY[d.rarity as RarityKey];
              return (
                <div
                  key={d.key}
                  className="rounded-2xl border-2 bg-card p-3 text-center"
                  style={{
                    borderColor: isFound ? r.color : 'hsl(var(--border))',
                    opacity: isFound ? 1 : 0.55,
                  }}
                >
                  <div className="text-3xl">{isFound ? d.emoji : '❓'}</div>
                  <p className="mt-1 truncate text-xs font-medium leading-tight">
                    {isFound ? tg(`discoveries.${d.key}.name`) : '???'}
                  </p>
                  {isFound && (
                    <span
                      className="mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: `${r.color}22`, color: r.color }}
                    >
                      {tg(`rarity.${d.rarity}`)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
