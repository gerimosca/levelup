'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Wine, Coins, Flame, Star, Dumbbell, Footprints, BookOpen, Trophy, Swords } from 'lucide-react';
import { getStatsAction } from '../game.actions';
import { CountUp } from './count-up';
import type { StatsView } from '../types';

const ATTRIBUTE_ORDER = ['vitality', 'strength', 'energy', 'resistance', 'discipline'] as const;
const MILESTONES = [7, 14, 30, 50, 100, 365];

function localDayDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ─── Racha ring ────────────────────────────────────────────────────────────────

function StreakRing({ current, next, progress }: { current: number; next: number; progress: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" width="92" height="92" className="shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="9" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke="url(#sg)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        transform="rotate(-90 50 50)"
      />
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6C5CE7" />
          <stop offset="1" stopColor="#FFD24A" />
        </linearGradient>
      </defs>
      <text x="50" y="48" textAnchor="middle" fontSize="26" fontWeight="800" fill="hsl(var(--foreground))">
        {current}
      </text>
      <text x="50" y="64" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">
        /{next}
      </text>
    </svg>
  );
}

// ─── Heatmap de actividad (8 semanas × 7 días) ────────────────────────────────

function ActivityHeatmap({ activity }: { activity: { date: string; count: number }[] }) {
  const maxCount = Math.max(1, ...activity.map((a) => a.count));
  // Pad to a full 8×7 grid (56 cells); activity is oldest-first.
  const cells = Array.from({ length: 56 }, (_, i) => activity[i] ?? { date: '', count: 0 });

  const colorFor = (count: number) => {
    if (count === 0) return 'hsl(var(--secondary))';
    const t = Math.min(count / maxCount, 1);
    if (t < 0.34) return 'rgba(255,210,74,0.35)';
    if (t < 0.67) return 'rgba(255,210,74,0.65)';
    return 'rgba(255,210,74,0.95)';
  };

  // Group by week (rows) for display: 8 rows × 7 cols.
  const weeks = Array.from({ length: 8 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div>
      <div className="flex gap-1">
        {/* Day-of-week labels column */}
        <div className="flex flex-col gap-1 pr-1">
          {dayLabels.map((d, i) => (
            <span key={i} className="flex h-5 w-4 items-center text-[9px] text-muted-foreground">{d}</span>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-1 flex-col gap-1">
            {week.map((cell, di) => (
              <div
                key={di}
                title={cell.date ? `${cell.date}: ${cell.count}` : ''}
                className="h-5 rounded-sm"
                style={{ backgroundColor: colorFor(cell.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0, 0.33, 0.66, 1].map((t) => (
          <div
            key={t}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: colorFor(Math.ceil(t * maxCount)) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ─── XP diario (14 días) ───────────────────────────────────────────────────────

function DailyXpChart({ days }: { days: { date: string; xp: number }[] }) {
  const maxXp = Math.max(1, ...days.map((d) => d.xp));
  return (
    <div className="flex h-14 items-end gap-0.5">
      {days.map((d, i) => {
        const ratio = d.xp / maxXp;
        const isToday = i === days.length - 1;
        const date = new Date(`${d.date}T12:00:00`);
        const label = date.toLocaleDateString('en', { weekday: 'narrow' });
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-0.5">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${Math.max(4, ratio * 100)}%`,
                backgroundColor: isToday ? 'hsl(var(--primary))' : `rgba(108,92,231,${0.18 + 0.55 * ratio})`,
                outline: isToday ? '2px solid hsl(var(--primary))' : undefined,
                outlineOffset: '2px',
              }}
              title={`${d.date}: ${d.xp} XP`}
            />
            {(i === 0 || i === days.length - 1) && (
              <span className="text-[8px] text-muted-foreground">{label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── XP por semana (barras SVG) ────────────────────────────────────────────────

function XpWeekChart({
  weeks,
  labelThisWeek,
  labelWeeksAgo,
}: {
  weeks: { weekStart: string; xp: number }[];
  labelThisWeek: string;
  labelWeeksAgo: (n: number) => string;
}) {
  const maxXp = Math.max(1, ...weeks.map((w) => w.xp));
  const lastIdx = weeks.length - 1;

  return (
    <div className="space-y-2">
      <div className="flex h-20 items-end gap-1">
        {weeks.map((w, i) => {
          const ratio = w.xp / maxXp;
          const isCurrentWeek = i === lastIdx;
          return (
            <div key={w.weekStart} className="flex flex-1 flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max(4, ratio * 100)}%`,
                  backgroundColor: isCurrentWeek
                    ? 'hsl(var(--primary))'
                    : `rgba(108,92,231,${0.2 + 0.5 * ratio})`,
                }}
                title={`${w.xp} XP`}
              />
            </div>
          );
        })}
      </div>
      {/* X-axis labels: only first and last */}
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{labelWeeksAgo(lastIdx)}</span>
        <span>{labelThisWeek}</span>
      </div>
    </div>
  );
}

// ─── Radar de atributos (SVG pentágono) ────────────────────────────────────────

const ATTR_COLORS: Record<string, string> = {
  vitality: '#FF6B6B',
  strength: '#6C5CE7',
  energy: '#FFD24A',
  resistance: '#00CEC9',
  discipline: '#74B9FF',
};

function AttributeRadar({
  attributes,
  labels,
}: {
  attributes: Record<string, number>;
  labels: Record<string, string>;
}) {
  const cx = 80;
  const cy = 80;
  const maxR = 62;
  const n = ATTRIBUTE_ORDER.length;

  // Rank capped at 10 for visual purposes
  const rankOf = (key: string) => Math.min(10, Math.floor((attributes[key] ?? 0) / 100) + 1);
  const maxRank = 10;

  const angleOf = (i: number) => ((2 * Math.PI * i) / n) - Math.PI / 2;

  const point = (i: number, r: number) => {
    const a = angleOf(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  };

  // Background rings
  const rings = [2, 4, 6, 8, 10].map((rank) =>
    ATTRIBUTE_ORDER.map((_, i) => point(i, (rank / maxRank) * maxR)).join(' '),
  );

  // Axes
  const axes = ATTRIBUTE_ORDER.map((_, i) => point(i, maxR));

  // Filled polygon
  const dataPoints = ATTRIBUTE_ORDER.map((key, i) => point(i, (rankOf(key) / maxRank) * maxR));
  const polyPoints = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  // Label positions (slightly outside maxR)
  const labelPoints = ATTRIBUTE_ORDER.map((_, i) => point(i, maxR + 14));

  return (
    <svg viewBox="0 0 160 160" className="mx-auto w-48" aria-hidden="true">
      {/* Background grid */}
      {rings.map((pts, ri) => (
        <polygon
          key={ri}
          points={pts}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.8"
        />
      ))}
      {/* Axes */}
      {axes.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth="0.8" />
      ))}
      {/* Data polygon */}
      <polygon
        points={polyPoints}
        fill="hsl(var(--primary) / 0.2)"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Vertex dots */}
      {dataPoints.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill={ATTR_COLORS[ATTRIBUTE_ORDER[i]] ?? 'hsl(var(--primary))'}
        />
      ))}
      {/* Labels */}
      {ATTRIBUTE_ORDER.map((key, i) => {
        const [lx, ly] = labelPoints[i];
        return (
          <text
            key={key}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8.5"
            fontWeight="600"
            fill={ATTR_COLORS[key] ?? 'hsl(var(--foreground))'}
          >
            {labels[key] ?? key}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 text-accent">{icon}</div>
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function StatsClient() {
  const ts = useTranslations('stats');
  const tg = useTranslations('game');
  const [stats, setStats] = useState<StatsView | null>(null);

  useEffect(() => {
    getStatsAction(localDayDate()).then(({ stats }) => {
      if (stats) setStats(stats);
    });
  }, []);

  if (!stats) {
    return <p className="py-24 text-center text-sm text-muted-foreground">{ts('loading')}</p>;
  }

  const next = MILESTONES.find((m) => m > stats.currentStreak) ?? MILESTONES[MILESTONES.length - 1];
  const progress = Math.min(1, stats.currentStreak / next);
  const ic = 'h-5 w-5';

  const attrLabels = Object.fromEntries(
    ATTRIBUTE_ORDER.map((key) => [key, tg(`attributes.${key}`)]),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{ts('title')}</h1>

      {/* Días sin alcohol + dinero ahorrado — solo si el usuario trackea alcohol */}
      {stats.daysAlcoholFree > 0 && (
        <section
          className="rounded-3xl border border-accent/40 p-6 text-center"
          style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgba(255,210,74,0.16), transparent 70%), hsl(var(--card))' }}
        >
          <Wine className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
          <p className="mt-1 text-5xl font-extrabold tabular-nums text-accent">
            <CountUp value={stats.daysAlcoholFree} />
          </p>
          <p className="text-sm text-muted-foreground">{ts('daysAlcoholFree')}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-bold">
            <Coins className="h-4 w-4 text-accent" aria-hidden="true" />
            <CountUp value={stats.moneySaved} /> €
            <span className="font-normal text-muted-foreground">{ts('moneySaved')}</span>
          </div>
        </section>
      )}

      {/* Racha con anillo + semana + hitos */}
      <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
        {/* Anillo + números */}
        <div className="flex items-center gap-5">
          <StreakRing current={stats.currentStreak} next={next} progress={progress} />
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Flame className="h-4 w-4 text-accent" aria-hidden="true" />
              {ts('currentStreak')}
            </p>
            <p className="text-3xl font-extrabold tabular-nums">
              <CountUp value={stats.currentStreak} />{' '}
              <span className="text-base font-normal text-muted-foreground">{ts('daysShort')}</span>
            </p>
            <p className="text-xs text-muted-foreground">{ts('streakGoal', { days: next })}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {ts('longestStreak')}: {stats.longestStreak}
            </p>
          </div>
        </div>

        {/* Últimos 7 días */}
        {stats.activity.length >= 7 && (() => {
          const last7 = stats.activity.slice(-7);
          return (
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {ts('streakWeekTitle')}
              </p>
              <div className="flex justify-between">
                {last7.map((a, i) => {
                  const date = new Date(`${a.date}T12:00:00`);
                  const dayLabel = date.toLocaleDateString('en', { weekday: 'narrow' });
                  const isToday = i === last7.length - 1;
                  const active = a.count > 0;
                  return (
                    <div key={a.date} className="flex flex-col items-center gap-1">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: active ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                          color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                          outline: isToday ? '2px solid hsl(var(--primary))' : undefined,
                          outlineOffset: '2px',
                          opacity: active ? 1 : 0.5,
                        }}
                        title={`${a.date}: ${a.count}`}
                      >
                        {active ? '✓' : '·'}
                      </div>
                      <span className="text-[9px] font-medium text-muted-foreground">{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Hitos */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{ts('milestonesTitle')}</p>
          <div className="flex flex-wrap gap-1.5">
            {MILESTONES.map((m) => {
              const done = stats.currentStreak >= m;
              const isNext = m === next;
              return (
                <span
                  key={m}
                  className="rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
                  style={{
                    backgroundColor: done
                      ? 'hsl(var(--primary))'
                      : isNext
                        ? 'rgba(108,92,231,0.12)'
                        : 'hsl(var(--secondary))',
                    color: done
                      ? 'hsl(var(--primary-foreground))'
                      : isNext
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted-foreground))',
                    outline: isNext ? '1.5px solid hsl(var(--primary))' : undefined,
                    opacity: done || isNext ? 1 : 0.45,
                  }}
                >
                  {m}d
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Constancia — heatmap 8 semanas */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-sm font-semibold">{ts('activityTitle')}</h2>
        <p className="mb-3 text-[11px] text-muted-foreground">
          {ts('activityCaption', { current: stats.monthHabits, prev: stats.prevMonthHabits })}
        </p>
        <ActivityHeatmap activity={stats.activity} />
      </section>

      {/* XP diario — últimos 14 días */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">{ts('xpDailyTitle')}</h2>
        <DailyXpChart days={stats.xpByDay} />
      </section>

      {/* XP por semana */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">{ts('xpChartTitle')}</h2>
        <XpWeekChart
          weeks={stats.xpByWeek}
          labelThisWeek={ts('xpChartThisWeek')}
          labelWeeksAgo={(n) => ts('xpChartWeeksAgo', { n })}
        />
      </section>

      {/* Radar de atributos */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">{ts('attributesTitle')}</h2>
        <AttributeRadar attributes={stats.attributes} labels={attrLabels} />
      </section>

      {/* Otras métricas */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Dumbbell className={ic} />} value={<CountUp value={stats.trainings} />} label={ts('trainings')} />
        <StatCard icon={<Footprints className={ic} />} value={<><CountUp value={stats.kmWalked} decimals={1} /> km</>} label={ts('kmWalked')} />
        <StatCard icon={<BookOpen className={ic} />} value={<CountUp value={stats.reads} />} label={ts('reads')} />
        <StatCard icon={<Trophy className={ic} />} value={<CountUp value={stats.level} />} label={ts('level')} />
        <StatCard icon={<Swords className={ic} />} value={<CountUp value={stats.seasonsCompleted} />} label={ts('seasonsCompleted')} />
      </div>

      {/* Hábitos más cumplidos */}
      {stats.habitRanking.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">{ts('habitRankingTitle')}</h2>
          <div className="space-y-2">
            {stats.habitRanking.map(({ habitKey, count }, i) => {
              const maxCount = stats.habitRanking[0].count;
              const ratio = count / maxCount;
              return (
                <div key={habitKey} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-[10px] font-bold text-muted-foreground">
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium truncate">
                        {tg(`habits.${habitKey}.name`)}
                      </span>
                      <span className="ml-2 shrink-0 text-[10px] tabular-nums text-muted-foreground">
                        {count}×
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${Math.round(ratio * 100)}%`, opacity: 0.6 + ratio * 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Día de semana más activo */}
      {stats.dayOfWeek.some((d) => d.count > 0) && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold">{ts('dowTitle')}</h2>
          <div className="flex items-end justify-between gap-1">
            {stats.dayOfWeek.map(({ day, count }) => {
              const maxCount = Math.max(1, ...stats.dayOfWeek.map((d) => d.count));
              const ratio = count / maxCount;
              const isMax = count === maxCount && count > 0;
              const dayLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day];
              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full overflow-hidden rounded-t-sm" style={{ height: 48 }}>
                    <div
                      className="mt-auto w-full rounded-t-sm transition-all duration-700"
                      style={{
                        height: `${Math.max(8, ratio * 100)}%`,
                        backgroundColor: isMax
                          ? 'hsl(var(--accent))'
                          : `rgba(108,92,231,${0.2 + 0.55 * ratio})`,
                        marginTop: `${(1 - Math.max(0.08, ratio)) * 100}%`,
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: isMax ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))' }}
                  >
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
          {(() => {
            const maxDay = stats.dayOfWeek.reduce((a, b) => (b.count > a.count ? b : a));
            if (!maxDay.count) return null;
            const names = [ts('dow.sun'), ts('dow.mon'), ts('dow.tue'), ts('dow.wed'), ts('dow.thu'), ts('dow.fri'), ts('dow.sat')];
            return (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {ts('dowBest', { day: names[maxDay.day] })}
              </p>
            );
          })()}
        </section>
      )}
    </div>
  );
}
