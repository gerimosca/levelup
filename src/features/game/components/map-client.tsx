'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Footprints, Swords, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { SEASONS_BY_KEY, zoneForDay, SEASON_ROADMAP, RARITY, type RarityKey } from '@/game-core';
import { usePlayerStore } from '@/shared/game';
import {
  getTodayStateAction,
  openChestAction,
  markVictorySeenAction,
  advanceSeasonAction,
} from '../game.actions';
import { SeasonVictoryOverlay, SeasonStartOverlay } from './overlays';
import { ChestReveal } from './chest-reveal';
import type { ChestRewardResult, TodayState } from '../types';

function localDayDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const ENEMY_IMAGE: Record<string, string> = {
  laziness: 'saboteur', inertia: 'inertia', craving: 'craving', void: 'void',
};

const ZONE_EMOJI: Record<string, string> = {
  // S1
  forest: '🌳', mountain: '⛰️', cave: '🕳️', volcano: '🌋',
  temple: '🏛️', city: '🏙️', castle: '🏰', summit: '🗻',
  // S2
  plains: '🌿', hills: '🏔️', gorge: '🪨', highlands: '🌄',
  ridge: '⛰️', glacier: '🧊',
  // S3
  desert: '🏜️', oasis: '🌴', dunes: '🌊', mesa: '🪨',
  canyon: '🏞️', spire: '🗽', zenith: '⭐',
  // S4
  sanctum: '🕍', labyrinth: '🌀', abyss: '🌑', dreamscape: '💫',
  void_edge: '🌌', mindscape: '🔮', astral: '✨', transcendence: '🌟',
};
const ZONE_COLOR: Record<string, string> = {
  // S1
  forest: '#2ECC71', mountain: '#4AC4F0', cave: '#8B5CF6', volcano: '#FF6B3D',
  temple: '#FFD24A', city: '#22D3B7', castle: '#A855F7', summit: '#93C5FD',
  // S2
  plains: '#84CC16', hills: '#78C7A2', gorge: '#92400E', highlands: '#86EFAC',
  ridge: '#A78BFA', glacier: '#BAE6FD',
  // S3
  desert: '#F59E0B', oasis: '#10B981', dunes: '#D97706', mesa: '#B45309',
  canyon: '#EF4444', spire: '#EC4899', zenith: '#8B5CF6',
  // S4
  sanctum: '#818CF8', labyrinth: '#A78BFA', abyss: '#1E1B4B', dreamscape: '#7C3AED',
  void_edge: '#4C1D95', mindscape: '#5B21B6', astral: '#C4B5FD', transcendence: '#FF2D78',
};
const SCENERY: Record<string, string> = {
  // S1
  forest: '🌲', mountain: '🪨', cave: '🦇', volcano: '🔥',
  temple: '🏺', city: '🏠', castle: '🛡️', summit: '❄️',
  // S2
  plains: '🌾', hills: '🐑', gorge: '🦅', highlands: '🐻',
  ridge: '🌬️', glacier: '🐻‍❄️',
  // S3
  desert: '🦎', oasis: '🐫', dunes: '🌵', mesa: '🦅',
  canyon: '🌄', spire: '🌙', zenith: '⚡',
  // S4
  sanctum: '🕯️', labyrinth: '🌀', abyss: '👁️', dreamscape: '💭',
  void_edge: '🌌', mindscape: '🧠', astral: '⭐', transcendence: '🔥',
};

type Status = 'done' | 'current' | 'locked';

const VW = 320;
const STEP = 62;
const PAD_TOP = 40;

const coord = (day: number) => ({
  x: VW / 2 + 96 * Math.sin((day - 1) * 0.72),
  y: PAD_TOP + (day - 1) * STEP,
});

export function MapClient() {
  const tm = useTranslations('map');
  const tg = useTranslations('game');
  const streak = usePlayerStore((s) => s.streak);
  const [today, setToday] = useState<TodayState | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [showSeasonStart, setShowSeasonStart] = useState(false);
  const [pendingSeasonKey, setPendingSeasonKey] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [chest, setChest] = useState<ChestRewardResult | null>(null);
  const [advance, setAdvance] = useState<{ xs: number[]; ys: number[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const focusRef = useRef<SVGGElement | null>(null);

  const load = useCallback(() => {
    getTodayStateAction(localDayDate()).then(({ state }) => {
      if (!state) return;
      setToday(state);
      if (state.season.completed && !state.season.victorySeen) setShowVictory(true);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Animación de avance: si has progresado desde la última visita, desliza
  // el marcador del nodo anterior al nuevo.
  useEffect(() => {
    if (!today || typeof window === 'undefined') return;
    const key = `levelup_map_seen_${today.season.key}`;
    const dc = today.season.daysCompleted;
    const dur = today.season.durationDays;
    const raw = localStorage.getItem(key);
    const lastSeen = raw == null ? dc : parseInt(raw, 10) || 0;
    if (dc > lastSeen) {
      const oldCur = Math.min(lastSeen + 1, dur);
      const newCur = Math.min(dc + 1, dur);
      if (newCur > oldCur) {
        const xs: number[] = [];
        const ys: number[] = [];
        for (let d = oldCur; d <= newCur; d++) {
          const c = coord(d);
          xs.push(c.x);
          ys.push(c.y - 26);
        }
        setAdvance({ xs, ys });
      }
    }
    localStorage.setItem(key, String(dc));
  }, [today]);

  // Auto-scroll del mapa a tu posición actual (solo dentro del contenedor)
  useEffect(() => {
    if (!today) return;
    const id = requestAnimationFrame(() => {
      const box = scrollRef.current;
      const node = focusRef.current;
      if (!box || !node) return;
      const boxRect = box.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      box.scrollTop += nodeRect.top - boxRect.top - box.clientHeight / 2 + nodeRect.height / 2;
    });
    return () => cancelAnimationFrame(id);
  }, [today]);

  // Toast de llegada a nueva zona
  useEffect(() => {
    if (!today || typeof window === 'undefined') return;
    const storageKey = `levelup_map_zone_${today.season.key}`;
    const prevZone = localStorage.getItem(storageKey);
    const currZone = today.season.zoneKey;
    if (prevZone && prevZone !== currZone && currZone) {
      const emoji = ZONE_EMOJI[currZone] ?? '🌍';
      const zoneName = tm(`zones.${currZone}`);
      setTimeout(() => {
        toast(`${emoji} ${tm('zoneArrival', { zone: zoneName })}`, {
          description: tm(`zoneDesc.${currZone}`),
          duration: 4500,
        });
      }, 900);
    }
    if (currZone) localStorage.setItem(storageKey, currZone);
  }, [today, tm]);

  if (!today) {
    return <p className="py-24 text-center text-sm text-muted-foreground">{tm('loading')}</p>;
  }

  const season = SEASONS_BY_KEY[today.season.key];
  if (!season) return null;

  const { daysCompleted, durationDays, completed } = today.season;
  const bossDay = durationDays;
  const focusDay = completed ? bossDay : Math.min(daysCompleted + 1, durationDays);

  const chestDays = new Set(
    season.zones
      .map((z, i) => (season.zones[i + 1] ? season.zones[i + 1].startDay : durationDays + 1) - 1)
      .filter((d) => d > 0 && d < bossDay),
  );

  const statusOf = (day: number): Status =>
    day <= daysCompleted ? 'done' : day === daysCompleted + 1 && !completed ? 'current' : 'locked';

  const nodes = Array.from({ length: durationDays }, (_, i) => {
    const day = i + 1;
    return {
      day,
      x: VW / 2 + 96 * Math.sin(i * 0.72),
      y: PAD_TOP + i * STEP,
      zone: zoneForDay(season, day).key,
      status: statusOf(day),
      isBoss: day === bossDay,
      isChest: chestDays.has(day),
    };
  });
  const svgH = PAD_TOP + (durationDays - 1) * STEP + 56;

  const pathOf = (slice: typeof nodes) =>
    slice.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x.toFixed(1)} ${n.y.toFixed(1)}`).join(' ');
  const fullPath = pathOf(nodes);
  const doneCount = Math.min(daysCompleted + 1, nodes.length);
  const donePath = doneCount > 1 ? pathOf(nodes.slice(0, doneCount)) : '';

  // Bandas de bioma (cada mundo se siente distinto)
  const yOf = (day: number) => nodes[day - 1].y;
  const bands = season.zones.map((z, i) => {
    const prev = season.zones[i - 1];
    const next = season.zones[i + 1];
    const top = i === 0 ? 0 : (yOf(z.startDay) + yOf(prev.startDay)) / 2;
    const bottom = next ? (yOf(z.startDay) + yOf(next.startDay)) / 2 : svgH;
    return { key: z.key, y: top, h: bottom - top };
  });

  const nodeFill = (n: (typeof nodes)[number]) =>
    n.isBoss && n.status === 'done' ? '#7f2238'
    : n.isBoss ? '#E74C6F'
    : n.status === 'done' ? ZONE_COLOR[n.zone]
    : n.status === 'current' ? '#FFD24A'
    : '#2a3340';
  const textFill = (n: (typeof nodes)[number]) =>
    n.status === 'current' ? '#1a1a1a' : n.status === 'locked' ? '#6B7689' : '#fff';

  const zoneFirsts = new Map(season.zones.map((z) => [z.startDay, z.key]));
  const activeOrder = SEASON_ROADMAP.find((s) => s.key === today.season.key)?.order ?? 1;
  const hasNextSeason = SEASON_ROADMAP.some((s) => s.order === activeOrder + 1 && s.playable);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <section className="rounded-3xl border border-border bg-card p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{tm('seasonNumber', { n: activeOrder })}</p>
        <h1 className="text-2xl font-extrabold tracking-wide">{tg(today.season.nameKey)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{tg(`seasonTagline.${today.season.key}`)}</p>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700"
            style={{ width: `${Math.round((daysCompleted / durationDays) * 100)}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{tm('progress', { done: daysCompleted, total: durationDays })}</p>
      </section>

      {/* Cómo avanzar */}
      <section className="space-y-2 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <h2 className="text-sm font-semibold">{tm('help.title')}</h2>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2"><Swords className="h-4 w-4 shrink-0 text-primary" />{tm('help.step1')}</li>
          <li className="flex items-center gap-2"><Footprints className="h-4 w-4 shrink-0 text-primary" />{tm('help.step2')}</li>
          <li className="flex items-center gap-2"><Trophy className="h-4 w-4 shrink-0 text-primary" />{tm('help.step3')}</li>
        </ul>
      </section>

      {/* Tu ruta — scroll horizontal de zonas */}
      {(() => {
        return (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {tm('routeTitle')}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {season.zones.map((z, i) => {
                const nextZone = season.zones[i + 1];
                const endDay = nextZone ? nextZone.startDay - 1 : durationDays;
                const zoneStatus: 'done' | 'active' | 'locked' =
                  daysCompleted >= endDay ? 'done'
                  : daysCompleted >= z.startDay - 1 ? 'active'
                  : 'locked';
                const color = ZONE_COLOR[z.key] ?? '#888';
                return (
                  <div
                    key={z.key}
                    className="flex min-w-[148px] max-w-[148px] shrink-0 flex-col rounded-2xl border-2 bg-card p-3 transition-opacity"
                    style={{
                      borderColor: zoneStatus === 'active' ? color
                        : zoneStatus === 'done' ? `${color}50`
                        : 'hsl(var(--border))',
                      opacity: zoneStatus === 'locked' ? 0.55 : 1,
                    }}
                  >
                    <div className="mb-1.5 flex items-start justify-between">
                      <span className="text-2xl" aria-hidden="true">{ZONE_EMOJI[z.key]}</span>
                      {zoneStatus === 'done' && (
                        <span className="text-[10px] font-bold text-muted-foreground">{tm('zoneDone')}</span>
                      )}
                      {zoneStatus === 'active' && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                          style={{ backgroundColor: `${color}25`, color }}
                        >
                          {tm('zoneNow')}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm font-bold leading-tight"
                      style={{ color: zoneStatus === 'locked' ? undefined : color }}
                    >
                      {tm(`zones.${z.key}`)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                      {tm(`zoneDesc.${z.key}`)}
                    </p>
                    <p className="mt-auto pt-2 text-[10px] text-muted-foreground">
                      {tm('zoneDays', { from: z.startDay, to: endDay })}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Detalle de casilla */}
      {selectedDay !== null && (() => {
        const selZoneKey = zoneForDay(season, selectedDay).key;
        const zoneColor = ZONE_COLOR[selZoneKey] ?? 'hsl(var(--primary))';
        return (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 bg-card p-4"
            style={{ borderColor: `${zoneColor}60` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">{ZONE_EMOJI[selZoneKey]}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">
                  {tm('detailDay', { day: selectedDay, zone: tm(`zones.${selZoneKey}`) })}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                  {tm(`zoneDesc.${selZoneKey}`)}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold" style={{ color: selectedDay === bossDay ? '#E74C6F' : zoneColor }}>
                  {selectedDay === bossDay
                    ? `💀 ${tm('detailBossPrefix')} ${tg(`enemy.${season.enemy.key}.name`)}`
                    : tm(`detailStatus.${statusOf(selectedDay)}`)}
                  {chestDays.has(selectedDay) ? ` · 🎁 ${tm('detailChest')}` : ''}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Sendero (scroll interno, auto-centrado en tu posición) */}
      <div ref={scrollRef} className="relative h-[58vh] overflow-y-auto rounded-3xl border border-border bg-background/40">
        <svg viewBox={`0 0 ${VW} ${svgH}`} width="100%" role="img" aria-label={tm('title')}>
          <defs>
            <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6C5CE7" />
              <stop offset="1" stopColor="#FFD24A" />
            </linearGradient>
            {bands.map((b) => (
              <linearGradient key={b.key} id={`band-${b.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={ZONE_COLOR[b.key]} stopOpacity="0.16" />
                <stop offset="1" stopColor={ZONE_COLOR[b.key]} stopOpacity="0.04" />
              </linearGradient>
            ))}
            <clipPath id="boss-portrait-clip">
              <circle cx={nodes[bossDay - 1].x} cy={nodes[bossDay - 1].y} r={18} />
            </clipPath>
          </defs>

          {/* bandas de bioma + ambientación */}
          {bands.map((b) => (
            <g key={b.key}>
              <rect x="0" y={b.y} width={VW} height={b.h} fill={`url(#band-${b.key})`} />
              {/* Scenery corners */}
              <text x="16" y={b.y + 28} fontSize="22" opacity="0.20">{SCENERY[b.key]}</text>
              <text x={VW - 28} y={b.y + b.h - 16} fontSize="22" opacity="0.20">{SCENERY[b.key]}</text>
              {/* Extra scattered scenery for depth */}
              <text x={VW * 0.22} y={b.y + b.h * 0.45} fontSize="15" opacity="0.13">{SCENERY[b.key]}</text>
              <text x={VW * 0.78} y={b.y + b.h * 0.28} fontSize="17" opacity="0.11">{SCENERY[b.key]}</text>
              <text x={VW * 0.65} y={b.y + b.h * 0.72} fontSize="13" opacity="0.10">{SCENERY[b.key]}</text>
              {/* Zone name watermark */}
              <text x={VW / 2} y={b.y + b.h / 2} textAnchor="middle" fontSize="36" fontWeight="900"
                fill={ZONE_COLOR[b.key]} opacity="0.04">
                {ZONE_EMOJI[b.key]}
              </text>
            </g>
          ))}

          {/* sendero */}
          <path d={fullPath} fill="none" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
          {donePath && <path d={donePath} fill="none" stroke="url(#trail)" strokeWidth="6" strokeLinecap="round" />}

          {/* START */}
          <text x={nodes[0].x} y={nodes[0].y - 24} textAnchor="middle" fontSize="11" fontWeight="800" fill="hsl(var(--muted-foreground))">
            {tm('start')}
          </text>

          {nodes.map((n, i) => (
            <motion.g
              key={n.day}
              ref={n.day === focusDay ? focusRef : undefined}
              onClick={() =>
                n.isChest && n.status === 'done'
                  ? openChestAction(n.day).then((r) => r.success && setChest(r))
                  : setSelectedDay(n.day)
              }
              style={{ cursor: 'pointer' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.6), type: 'spring', stiffness: 260, damping: 18 }}
            >
              {zoneFirsts.get(n.day) && (
                <text x={n.x < VW / 2 ? n.x + 26 : n.x - 26} y={n.y - 18}
                  textAnchor={n.x < VW / 2 ? 'start' : 'end'} fontSize="12" fontWeight="700" fill={ZONE_COLOR[n.zone]}>
                  {ZONE_EMOJI[n.zone]} {tm(`zones.${n.zone}`)}
                </text>
              )}

              {/* Pulse para nodo actual */}
              {n.status === 'current' && (
                <motion.circle cx={n.x} cy={n.y} r={20} fill="none" stroke="#FFD24A" strokeWidth="2.5"
                  animate={{ r: [17, 30, 17], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }} />
              )}
              {/* Glow rojo para el jefe */}
              {n.isBoss && (
                <motion.circle cx={n.x} cy={n.y} r={30} fill="none" stroke="#E74C6F" strokeWidth="2"
                  animate={{ r: [26, 38, 26], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2.2, repeat: Infinity }} />
              )}
              {selectedDay === n.day && (
                <circle cx={n.x} cy={n.y} r={n.isBoss ? 28 : 20} fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" opacity="0.5" />
              )}

              <circle cx={n.x} cy={n.y} r={n.isBoss ? 22 : 15} fill={nodeFill(n)} stroke="#23293a" strokeWidth="2.5"
                opacity={n.status === 'locked' ? 0.85 : 1} />

              {n.isBoss ? (
                <>
                  {/* Retrato del enemigo si está disponible */}
                  <image
                    href={`/enemies/${ENEMY_IMAGE[season.enemy.key] ?? season.enemy.key}.png`}
                    x={n.x - 18}
                    y={n.y - 18}
                    width={36}
                    height={36}
                    clipPath="url(#boss-portrait-clip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  {/* Overlay oscuro si está vivo (da sensación de amenaza) */}
                  {n.status !== 'done' && (
                    <circle cx={n.x} cy={n.y} r={18} fill="rgba(0,0,0,0.35)" />
                  )}
                  {n.status === 'done' && (
                    <text x={n.x} y={n.y + 6} textAnchor="middle" fontSize="14">✓</text>
                  )}
                </>
              ) : (
                <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill={textFill(n)}>{n.day}</text>
              )}
              {n.isChest && <text x={n.x + 16} y={n.y - 8} textAnchor="middle" fontSize="15">🎁</text>}

              {/* marcador "estás aquí" */}
              {n.day === focusDay && !completed && !advance && (
                <text x={n.x} y={n.y - 26} textAnchor="middle" fontSize="17">⚔️</text>
              )}
            </motion.g>
          ))}

          {/* marcador que avanza de nodo a nodo */}
          {advance && (
            <motion.text
              textAnchor="middle"
              fontSize="17"
              initial={{ x: advance.xs[0], y: advance.ys[0] }}
              animate={{ x: advance.xs, y: advance.ys }}
              transition={{ duration: Math.max(0.7, advance.xs.length * 0.45), ease: 'easeInOut' }}
              onAnimationComplete={() => setAdvance(null)}
            >
              ⚔️
            </motion.text>
          )}
        </svg>
      </div>

      {/* Roadmap de temporadas (gating) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tm('seasonsTitle')}</h2>
        <ul className="space-y-2">
          {SEASON_ROADMAP.map((s, i) => {
            const isActive = s.key === today.season.key;
            const status = isActive ? (completed ? 'done' : 'active') : s.order < activeOrder ? 'done' : 'locked';
            const prev = SEASON_ROADMAP[i - 1];
            return (
              <li key={s.key} className={`flex items-center justify-between rounded-2xl border p-3 ${
                status === 'active' ? 'border-primary/50 bg-primary/10'
                : status === 'done' ? 'border-accent/40 bg-accent/5'
                : 'border-border bg-card opacity-70'}`}>
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {i + 1}. {tg(s.nameKey)}{' '}
                    <span className="font-normal text-muted-foreground">· {tm('seasonDays', { days: s.durationDays })}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status === 'active' ? tm('seasonStatus.active')
                      : status === 'done' ? tm('seasonStatus.done')
                      : prev ? tm('seasonUnlock', { prev: tg(prev.nameKey) }) : tm('seasonStatus.locked')}
                  </p>
                </div>
                <span aria-hidden="true">{status === 'active' ? '⚔️' : status === 'done' ? '✅' : '🔒'}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Cofre */}
      {chest && (
        <ChestReveal
          chest={chest}
          rarityColor={chest.rarity ? RARITY[chest.rarity as RarityKey].color : '#fff'}
          rarityGlow={chest.rarity ? RARITY[chest.rarity as RarityKey].glow : 'transparent'}
          rarityLabel={chest.rarity ? tg(`rarity.${chest.rarity}`) : ''}
          itemName={chest.itemKey ? tg(`equipment.${chest.itemKey}.name`) : ''}
          newLabel={tm('chestNew')}
          ownedLabel={tm('chestOwned')}
          closeLabel={tm('chestClose')}
          onClose={() => setChest(null)}
        />
      )}

      {showVictory && (() => {
        const nextDef = hasNextSeason
          ? SEASONS_BY_KEY[SEASON_ROADMAP.find((s) => s.order === activeOrder + 1)?.key ?? '']
          : null;
        const nextName = nextDef ? tg(nextDef.nameKey) : null;
        return (
          <SeasonVictoryOverlay
            seasonName={tg(today.season.nameKey)}
            enemyName={tg(`enemy.${season?.enemy.key ?? 'saboteur'}.name`)}
            enemyKey={season?.enemy.key ?? 'saboteur'}
            daysCompleted={today.season.daysCompleted}
            streak={streak}
            nextSeasonName={nextName}
            conquered={tg('ui.victory.conquered', { days: today.season.daysCompleted })}
            peakStreak={tg('ui.victory.peakStreak', { streak })}
            enemyDefeated={tg('ui.victory.enemyDefeated', { enemy: tg(`enemy.${season?.enemy.key ?? 'saboteur'}.name`) })}
            nextTeaser={nextName ? tg('ui.victory.nextTeaser', { name: nextName }) : null}
            cta={nextName ? tg('ui.victory.cta', { name: nextName }) : tg('ui.victory.ctaFinal')}
            onClose={() => {
              setShowVictory(false);
              if (hasNextSeason) {
                void (async () => {
                  await markVictorySeenAction(today.season.key);
                  const res = await advanceSeasonAction();
                  if (res.success && res.nextSeasonKey) {
                    setPendingSeasonKey(res.nextSeasonKey);
                    setShowSeasonStart(true);
                  } else {
                    load();
                  }
                })();
              } else {
                void markVictorySeenAction(today.season.key);
              }
            }}
          />
        );
      })()}
      {showSeasonStart && pendingSeasonKey && (() => {
        const def = SEASONS_BY_KEY[pendingSeasonKey];
        if (!def) return null;
        return (
          <SeasonStartOverlay
            seasonName={tg(def.nameKey)}
            enemyName={tg(`enemy.${def.enemy.key}.name`)}
            enemyKey={def.enemy.key}
            tagline={tg(`seasonTagline.${def.key}`)}
            durationDays={def.durationDays}
            badge={tg('ui.newSeason.challenge', { days: def.durationDays, enemy: tg(`enemy.${def.enemy.key}.name`) })}
            cta={tg('ui.newSeason.cta')}
            onClose={() => {
              setShowSeasonStart(false);
              setPendingSeasonKey(null);
              load();
            }}
          />
        );
      })()}
    </div>
  );
}
