'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { Flame, ShieldAlert, Compass, Hammer } from 'lucide-react';
import {
  getHabit,
  pickNpcGreeting,
  CAMP_STRUCTURES_BY_KEY,
  DISCOVERIES_BY_KEY,
  SEASONS_BY_KEY,
  SEASONS,
  RARITY,
  TITLES_BY_KEY,
  chapterForStructure,
  petActivityForHour,
  type HabitKey,
  type RarityKey,
} from '@/game-core';
import { usePlayerStore, audio, haptics } from '@/shared/game';
import {
  getTodayStateAction,
  claimHabitAction,
  logRelapseAction,
  claimExpeditionAction,
  buildStructureAction,
  markVictorySeenAction,
  advanceSeasonAction,
} from '../game.actions';
import type { ClaimResult, ClaimExpeditionResult, MissionView, TodayState } from '../types';
import { XpBar } from './xp-bar';
import { MissionCard } from './mission-card';
import { EnemyHealthBar } from './enemy-health-bar';
import { EventBanner } from './event-banner';
import { CharacterStage } from './character-stage';
import { PetStage } from './pet-stage';
import { CampScene, NPC_EMOJI } from './camp-scene';
import { FloatingReward } from './floating-reward';
import { Onboarding } from './onboarding';
import { ClaimValueDialog } from './claim-value-dialog';
import { LevelUpOverlay, MissionCompleteOverlay, StreakMilestoneOverlay, SeasonVictoryOverlay, SeasonStartOverlay } from './overlays';
import { CraftForge } from './craft-forge';

const ZONE_EMOJI: Record<string, string> = {
  forest: '🌳', mountain: '⛰️', cave: '🕳️', volcano: '🌋',
  temple: '🏛️', city: '🏙️', castle: '🏰', summit: '🗻',
  plains: '🌿', hills: '🏔️', gorge: '🪨', highlands: '🌄',
  ridge: '⛰️', glacier: '🧊',
  desert: '🏜️', oasis: '🌴', dunes: '🌊', mesa: '🪨',
  canyon: '🏞️', spire: '🗽', zenith: '⭐',
  sanctum: '🕍', labyrinth: '🌀', abyss: '🌑', dreamscape: '💫',
  void_edge: '🌌', mindscape: '🔮', astral: '✨', transcendence: '🌟',
};

function localDayDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const GRADED_UNIT: Partial<Record<HabitKey, string>> = {
  water: 'liters',
  sleep: 'hours',
  steps: 'steps',
};

function fullValueFor(habit: HabitKey): number {
  const h = getHabit(habit);
  return h.type === 'graded' && h.graded ? h.graded.target : 1;
}

export function HomeClient() {
  const tg = useTranslations('game');
  const th = useTranslations('home');
  const tmap = useTranslations('map');
  const locale = useLocale();

  const [today, setToday] = useState<TodayState | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [claiming, setClaiming] = useState<HabitKey | null>(null);
  const [valuePrompt, setValuePrompt] = useState<MissionView | null>(null);
  const [relapsing, setRelapsing] = useState(false);
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
  const [mcBonus, setMcBonus] = useState<number | null>(null);
  const [floating, setFloating] = useState<{ key: number; amount: number } | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const [attackKey, setAttackKey] = useState(0);
  const [hitKey, setHitKey] = useState(0);
  const [relapseKey, setRelapseKey] = useState(0);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const [defeatedKey, setDefeatedKey] = useState(0);
  const [expResult, setExpResult] = useState<ClaimExpeditionResult | null>(null);
  const [storyChapter, setStoryChapter] = useState<string | null>(null);
  const [busyWorld, setBusyWorld] = useState(false);
  const floatKey = useRef(0);
  const [dayDate] = useState(localDayDate);
  const [npcLineIdx, setNpcLineIdx] = useState(0);
  const [streakMilestoneHit, setStreakMilestoneHit] = useState<number | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [victoryPending, setVictoryPending] = useState(false);
  const [nextSeasonKey, setNextSeasonKey] = useState<string | null>(null);
  const [claimingVictory, setClaimingVictory] = useState(false);

  const level = usePlayerStore((s) => s.level);
  const streak = usePlayerStore((s) => s.streak);
  const hydrate = usePlayerStore((s) => s.hydrate);
  const addXp = usePlayerStore((s) => s.addXp);

  const load = useCallback(() => {
    setLoadError(false);
    getTodayStateAction(dayDate)
      .then(({ state }) => {
        if (!state) { setLoadError(true); return; }
        setToday(state);
        hydrate({ xpTotal: state.player.xpTotal, streak: state.player.streak });
      })
      .catch(() => setLoadError(true));
  }, [dayDate, hydrate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (today?.season.completed && !today.season.victorySeen) {
      setVictoryPending(true);
    }
  }, [today]);

  const handleClaimVictory = async () => {
    if (!today || claimingVictory) return;
    setClaimingVictory(true);
    const [, advance] = await Promise.all([
      markVictorySeenAction(today.season.key),
      advanceSeasonAction(),
    ]);
    setVictoryPending(false);
    setClaimingVictory(false);
    if (advance.success && advance.nextSeasonKey) {
      audio.play('seasonEnd');
      haptics.trigger('success');
      setNextSeasonKey(advance.nextSeasonKey);
    }
    load();
  };

  if (!today) {
    if (loadError) {
      return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <span className="text-5xl">📡</span>
          <p className="font-semibold">{th('offlineTitle')}</p>
          <p className="max-w-xs text-sm text-muted-foreground">{th('offlineBody')}</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {th('offlineRetry')}
          </button>
        </div>
      );
    }
    return (
      <p className="py-24 text-center text-sm text-muted-foreground">{th('loading')}</p>
    );
  }

  if (!today.onboarded) {
    return <Onboarding onDone={load} />;
  }

  const markClaimed = (habit: HabitKey) =>
    setToday((prev) => {
      if (!prev) return prev;
      const mark = (m: MissionView) => (m.habit === habit ? { ...m, claimed: true } : m);
      return {
        ...prev,
        missions: { main: mark(prev.missions.main), secondary: prev.missions.secondary.map(mark) },
      };
    });

  const doClaim = async (mission: MissionView, value: number) => {
    setValuePrompt(null);
    setClaiming(mission.habit);
    audio.play('claim');
    haptics.trigger('success');
    addXp(mission.xp);
    markClaimed(mission.habit);
    floatKey.current += 1;
    setFloating({ key: floatKey.current, amount: mission.xp });
    setCelebrate((c) => c + 1);
    setAttackKey((k) => k + 1);
    const enemyWasAlive = (today?.enemy.hpCurrent ?? 0) > 0;

    const res: ClaimResult = await claimHabitAction({ habitKey: mission.habit, value, dayDate });
    setClaiming(null);
    setHitKey((k) => k + 1);

    if (!res.success) {
      toast.error(res.error ?? tg('ui.genericError'));
      return;
    }
    hydrate({ xpTotal: res.player.xpTotal, streak: res.player.streak });
    setToday((prev) =>
      prev
        ? {
            ...prev,
            enemy: {
              ...prev.enemy,
              ...res.enemy,
              pct: res.enemy.hpMax > 0 ? res.enemy.hpCurrent / res.enemy.hpMax : 0,
            },
          }
        : prev,
    );

    if (enemyWasAlive && res.enemy.hpCurrent <= 0) {
      setDefeatedKey((k) => k + 1);
    }

    if (res.leveledUp) {
      audio.play('levelUp');
      haptics.trigger('success');
      setLevelUpKey((k) => k + 1);
      setLevelUpTo(res.levelAfter);
    }
    if (res.missionComplete) {
      audio.play('missionComplete');
      setMcBonus(res.bonusXp);
    }
    if (res.streakSaved) {
      haptics.trigger('warning');
      toast.success(tg('ui.streakSaved'));
    }
    if (res.streakMilestone) {
      audio.play('streakMilestone');
      haptics.trigger('success');
      setStreakMilestoneHit(res.streakMilestone);
    }
    if (res.newAchievements.length > 0) {
      audio.play('chest');
      haptics.trigger('success');
      setAchievementQueue((q) => [...q, ...res.newAchievements]);
    }
    if (res.newTitles && res.newTitles.length > 0) {
      haptics.trigger('success');
      toast.success(`👑 ${tg(`titles.${res.newTitles[0]}`)}`);
    }
    if (res.streakMultiplier > 1) {
      toast(`🔥 ×${res.streakMultiplier.toFixed(1)} ${tg('ui.streakBonus')}`, { duration: 2000 });
    }
    if (res.attrBonusXp > 0) {
      toast(`⚡ +${res.attrBonusXp} XP ${tg('ui.attrBonus')}`, { duration: 2000 });
    }
    // Refresca el mundo (expedición lanzada, materiales ganados, campamento).
    load();
  };

  const claimExpedition = async () => {
    if (busyWorld) return;
    setBusyWorld(true);
    const res = await claimExpeditionAction(dayDate);
    setBusyWorld(false);
    if (res.success && res.reward) {
      audio.play('chest');
      haptics.trigger('success');
      setExpResult(res);
      load();
    } else if (!res.success) {
      toast.error(tg('ui.genericError'));
    }
  };

  const buildNext = async () => {
    if (!today?.camp.next || !today.camp.canBuildNext || busyWorld) return;
    const key = today.camp.next.key;
    setBusyWorld(true);
    const res = await buildStructureAction(key);
    setBusyWorld(false);
    if (res.success) {
      audio.play('chest');
      haptics.trigger('success');
      const npcKey = CAMP_STRUCTURES_BY_KEY[key]?.npc;
      if (npcKey) {
        toast.success(th('newVillager', { name: tg(`npcs.${npcKey}.name`) }));
      } else {
        toast.success(tg(`structures.${key}`));
      }
      const chapter = chapterForStructure(key);
      if (chapter) setStoryChapter(chapter.key);
      load();
    } else {
      toast.error(tg('ui.genericError'));
    }
  };

  function remainingTime(readyAt: string): string {
    const ms = new Date(readyAt).getTime() - Date.now();
    if (ms <= 0) return '';
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const startClaim = (mission: MissionView) => {
    if (mission.claimed || claiming) return;
    if (getHabit(mission.habit).type === 'graded') {
      setValuePrompt(mission);
    } else {
      void doClaim(mission, 1);
    }
  };

  const logRelapse = async () => {
    if (today.relapsedToday || relapsing) return;
    setRelapsing(true);
    const res = await logRelapseAction(dayDate);
    setRelapsing(false);
    if (!res.success) return;
    haptics.trigger('warning');
    audio.play('enemyHit');
    setRelapseKey((k) => k + 1);
    setToday((prev) =>
      prev
        ? {
            ...prev,
            relapsedToday: true,
            enemy: {
              ...prev.enemy,
              ...res.enemy,
              pct: res.enemy.hpMax > 0 ? res.enemy.hpCurrent / res.enemy.hpMax : 0,
            },
          }
        : prev,
    );
    toast(tg('relapse.done'));
  };

  const event = today.event;
  const enemy = today.enemy;
  const npcGreeting = pickNpcGreeting(new Set(today.camp.built), dayDate);
  const cycleNpcLine = () => setNpcLineIdx((i) => (i + 1) % 3);
  const petActivity = petActivityForHour(new Date().getHours(), today.pet.mood);

  const activeSeason = SEASONS_BY_KEY[today.season.key];
  const enemyKey = activeSeason?.enemy.key ?? 'saboteur';
  const anchorSet = new Set(activeSeason?.anchorHabits ?? []);
  const anchorMissions = today.missions.secondary.filter((m) => anchorSet.has(m.habit));
  const rotatingMissions = today.missions.secondary.filter((m) => !anchorSet.has(m.habit));

  const ATTR_COLOR: Record<string, string> = {
    vitality: '#2ECC71', strength: '#FF7A45', discipline: '#6C5CE7',
    energy: '#4AC4F0', resistance: '#FFD24A',
  };
  const domAttr = today.dominantAttr;
  const domRank = domAttr?.rank ?? 0;
  const heroAuraColor = domAttr && domRank >= 3 ? ATTR_COLOR[domAttr.key] : undefined;
  const heroAuraStrength: 'subtle' | 'medium' | 'strong' =
    domRank >= 7 ? 'strong' : domRank >= 5 ? 'medium' : 'subtle';
  const activeTitle = today.avatarConfig?.activeTitle;
  const heroTitle = activeTitle && TITLES_BY_KEY[activeTitle]
    ? tg(`titles.${activeTitle}`)
    : domAttr && domRank >= 3
      ? `${tg(`attrTitle.bearer`)} ${tg(`attributes.${domAttr.key}`)}`
      : undefined;

  return (
    <div className="space-y-6">
      {/* Contexto: temporada + racha */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold tracking-widest text-foreground/80">
            {tg(today.season.nameKey)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-accent">
            <Flame className="h-4 w-4" aria-hidden="true" />
            {tg('ui.streak', { days: streak })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (today.season.daysCompleted / today.season.durationDays) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {today.season.daysCompleted}/{today.season.durationDays}
          </span>
        </div>
      </div>

      {event.multiplier > 1 && (
        <EventBanner name={tg(`events.${event.key}.name`)} desc={tg(`events.${event.key}.desc`)} />
      )}

      {/* Campamento (la Home): escena viva con héroe + mascota */}
      <section className="space-y-3">
        <div className="relative">
          {floating && (
            <FloatingReward
              key={floating.key}
              amount={floating.amount}
              onDone={() => setFloating(null)}
            />
          )}
          <CampScene built={today.camp.built} expeditionReady={today.expedition.ready}>
            {/* Héroe centrado como protagonista de la escena */}
            <div className="relative">
              <CharacterStage
                size="hero"
                tier={level.tier}
                tierLabel={tg(`tiers.${level.tier}`)}
                levelLabel={th('levelLabel', { level: level.level })}
                equipped={today.equipped}
                avatarConfig={today.avatarConfig}
                celebrateKey={celebrate}
                attackKey={attackKey}
                levelUpKey={levelUpKey}
                auraColor={heroAuraColor}
                auraStrength={heroAuraStrength}
                titleText={heroTitle}
              />
              {/* Mascota — flotando en la esquina inferior derecha del personaje */}
              <Link
                href={`/${locale}/pet`}
                aria-label={tg(`petStage.${today.pet.stage}`)}
                className="absolute -bottom-2 -right-10"
              >
                <PetStage stage={today.pet.stage} mood={today.pet.mood} size={72} activity={petActivity} />
              </Link>
            </div>
          </CampScene>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3">
          <XpBar current={level.xpIntoLevel} max={level.xpForNext} />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {th('xpProgress', { current: level.xpIntoLevel, max: level.xpForNext })}
          </p>
          <div className="mt-2 flex items-center justify-center gap-5 text-sm font-bold">
            <span>🪵 {today.materials.wood ?? 0}</span>
            <span>🪨 {today.materials.stone ?? 0}</span>
            {today.pet.shields > 0 && (
              <span className="text-xs font-semibold text-blue-400" title="Active shields">
                {th('shields', { count: today.pet.shields })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Saludo de un habitante — tappable para ciclar líneas */}
      {npcGreeting && (
        <button
          type="button"
          onClick={cycleNpcLine}
          className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-accent/5"
          aria-label={tg(`npcs.${npcGreeting.key}.name`)}
        >
          <span className="text-2xl" aria-hidden="true">
            {NPC_EMOJI[npcGreeting.key] ?? '🧍'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-accent">{tg(`npcs.${npcGreeting.key}.name`)}</p>
            <p className="text-sm text-muted-foreground">
              {tg(`npcLines.${npcGreeting.key}.${npcLineIdx}`, {
                streak,
                level: level.level,
              })}
            </p>
          </div>
          <span className="mt-0.5 shrink-0 text-xs text-muted-foreground/40" aria-hidden="true">›</span>
        </button>
      )}

      {/* Expedición */}
      {today.expedition.ready ? (
        <motion.button
          type="button"
          onClick={claimExpedition}
          disabled={busyWorld}
          className="w-full rounded-2xl border-2 border-accent/70 bg-accent/10 p-5 disabled:opacity-60"
          animate={{ boxShadow: ['0 0 0px rgba(34,211,183,0)', '0 0 18px rgba(34,211,183,0.35)', '0 0 0px rgba(34,211,183,0)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center justify-center gap-2.5">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 1.2, delay: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              🎒
            </motion.span>
            <span className="font-semibold text-accent">{th('expedition.ready')}</span>
          </div>
        </motion.button>
      ) : today.expedition.active && today.expedition.readyAt ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <span className="text-2xl">🗺️</span>
              <motion.span
                className="absolute -right-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full bg-accent"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{th('expedition.outTitle')}</p>
              <p className="text-xs text-muted-foreground">
                {th('expedition.out', {
                  zone: `${ZONE_EMOJI[today.season.zoneKey] ?? '🌍'} ${tmap(`zones.${today.season.zoneKey}`)}`,
                  time: remainingTime(today.expedition.readyAt),
                })}
              </p>
            </div>
          </div>
          {/* mini sendero animado */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-lg" aria-hidden="true">🏕️</span>
            <div className="flex flex-1 items-center gap-0.5">
              {Array.from({ length: 7 }, (_, i) => (
                <motion.div
                  key={i}
                  className="h-0.5 flex-1 rounded-full bg-accent"
                  animate={{ opacity: [0.15, 0.9, 0.15] }}
                  transition={{ duration: 1.4, delay: i * 0.14, repeat: Infinity }}
                />
              ))}
            </div>
            <motion.span
              className="text-lg"
              aria-hidden="true"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {ZONE_EMOJI[today.season.zoneKey] ?? '🧭'}
            </motion.span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-muted-foreground">
          <Compass className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-xs">
            {today.missions.main.claimed
              ? th('expedition.departHint')
              : th('expedition.idleHint')}
          </p>
        </div>
      )}

      {/* Construir campamento */}
      {today.camp.next ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Hammer className="h-4 w-4 text-primary" aria-hidden="true" />
              {tg(`structures.${today.camp.next.key}`)}
            </p>
            <p className="text-xs text-muted-foreground">
              {th('build.cost')}:{' '}
              {Object.entries(today.camp.next.cost)
                .map(([k, v]) => {
                  const has = k === 'wood' ? (today.materials.wood ?? 0) : (today.materials.stone ?? 0);
                  const emoji = k === 'wood' ? '🪵' : '🪨';
                  const enough = has >= (v ?? 0);
                  return `${emoji} ${has}/${v}${enough ? ' ✓' : ''}`;
                })
                .join('   ')}
            </p>
            {!today.camp.canBuildNext && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {th('build.howToEarn')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={buildNext}
            disabled={!today.camp.canBuildNext || busyWorld}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
          >
            {th('build.action')}
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">{th('build.maxed')}</p>
      )}

      {/* Fragua — visible cuando el campamento tiene workshop */}
      {today.camp.built.includes('workshop') && (
        <CraftForge
          materials={today.materials}
          onCrafted={load}
        />
      )}

      {/* Misiones */}
      <section className="space-y-3">
        <h1 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {th('missionsTitle')}
        </h1>
        <MissionCard
          mission={today.missions.main}
          label={tg(`habits.${today.missions.main.habit}.name`)}
          claimLabel={tg('ui.claim')}
          claimedLabel={tg('ui.claimed')}
          mainBadge={tg('ui.mainBadge')}
          claiming={claiming === today.missions.main.habit}
          onClaim={() => startClaim(today.missions.main)}
        />
        {anchorMissions.map((m) => (
          <MissionCard
            key={m.habit}
            mission={m}
            label={tg(`habits.${m.habit}.name`)}
            claimLabel={tg('ui.claim')}
            claimedLabel={tg('ui.claimed')}
            claiming={claiming === m.habit}
            onClaim={() => startClaim(m)}
          />
        ))}
        {rotatingMissions.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground">🔄 {th('dailyPick')}</p>
            {rotatingMissions.map((m) => (
              <MissionCard
                key={m.habit}
                mission={m}
                label={tg(`habits.${m.habit}.name`)}
                claimLabel={tg('ui.claim')}
                claimedLabel={tg('ui.claimed')}
                claiming={claiming === m.habit}
                onClaim={() => startClaim(m)}
              />
            ))}
          </>
        )}
      </section>

      {/* Banner día completo */}
      {(() => {
        const allMissions = [today.missions.main, ...today.missions.secondary];
        const allClaimed = allMissions.length > 0 && allMissions.every((m) => m.claimed);
        return allClaimed ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/30 bg-primary/8 px-4 py-3.5 text-center"
          >
            <p className="text-sm font-bold text-primary">{th('dayComplete.title')}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{th('dayComplete.body')}</p>
          </motion.div>
        ) : null;
      })()}

      {/* Enemigo de temporada + logger de recaída */}
      <section className="space-y-2">
        <EnemyHealthBar
          name={tg(`enemy.${enemyKey}.name`)}
          enemyKey={enemyKey}
          pct={enemy.pct}
          defeated={enemy.hpCurrent <= 0}
          defeatedLabel={tg('ui.enemyDefeated')}
          hitKey={hitKey}
          relapseKey={relapseKey}
          defeatedKey={defeatedKey}
        />
        {today.relapsedToday ? (
          <p className="text-center text-xs text-muted-foreground">{tg('relapse.logged')}</p>
        ) : (
          <button
            type="button"
            onClick={logRelapse}
            disabled={relapsing}
            className="inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-60"
          >
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            {tg('relapse.prompt')}
          </button>
        )}
      </section>


      {valuePrompt && (
        <ClaimValueDialog
          title={tg(`habits.${valuePrompt.habit}.name`)}
          unit={tg(`claimValue.unit.${GRADED_UNIT[valuePrompt.habit] ?? 'steps'}`)}
          defaultValue={fullValueFor(valuePrompt.habit)}
          confirmLabel={tg('ui.claim')}
          cancelLabel={tg('claimValue.cancel')}
          onConfirm={(value) => doClaim(valuePrompt, value)}
          onCancel={() => setValuePrompt(null)}
        />
      )}
      {levelUpTo !== null && (
        <LevelUpOverlay
          title={tg('ui.levelUp.title', { level: levelUpTo })}
          subtitle={tg('ui.levelUp.subtitle')}
          cta={tg('ui.levelUp.cta')}
          onClose={() => setLevelUpTo(null)}
        />
      )}
      {mcBonus !== null && (
        <MissionCompleteOverlay
          title={tg('ui.missionComplete.title')}
          subtitle={tg('ui.missionComplete.subtitle', { bonus: mcBonus })}
          cta={tg('ui.missionComplete.cta')}
          onClose={() => setMcBonus(null)}
        />
      )}
      {streakMilestoneHit !== null && (
        <StreakMilestoneOverlay
          title={tg('ui.streakMilestone.title', { days: streakMilestoneHit })}
          label={tg(`ui.streakMilestone.label.${streakMilestoneHit}`)}
          sub={tg('ui.streakMilestone.sub')}
          cta={tg('ui.streakMilestone.cta')}
          onClose={() => setStreakMilestoneHit(null)}
        />
      )}

      {achievementQueue.length > 0 && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setAchievementQueue((q) => q.slice(1))}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-accent/40 bg-card p-7 text-center"
            style={{ boxShadow: '0 0 60px rgba(255,210,74,0.25)' }}
            initial={{ y: 80, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="mx-auto mb-3 text-6xl"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.3, 0.9, 1.05, 1], rotate: 0 }}
              transition={{ duration: 0.65, ease: 'backOut' }}
            >
              🏅
            </motion.div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              {tg('ui.achievementUnlockedBadge')}
            </p>
            <h2 className="mt-1 text-xl font-extrabold">
              {tg(`achievements.${achievementQueue[0]}.name`)}
            </h2>
            {achievementQueue.length > 1 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {tg('ui.achievementMore', { count: achievementQueue.length - 1 })}
              </p>
            )}
            <button
              type="button"
              onClick={() => setAchievementQueue((q) => q.slice(1))}
              className="mt-5 w-full rounded-xl bg-accent py-3 font-semibold transition-transform active:scale-95"
              style={{ color: 'hsl(218 22% 7%)' }}
            >
              {tg('ui.achievementCta')}
            </button>
          </motion.div>
        </motion.div>
      )}

      {victoryPending && (() => {
        // Calcula la siguiente temporada desde el roadmap directamente —
        // nextSeasonKey todavía es null cuando este overlay se abre (se setea al cerrarlo).
        const currentOrder = activeSeason?.order ?? 0;
        const nextDef = SEASONS.find((s) => s.order === currentOrder + 1) ?? null;
        const nextName = nextDef ? tg(nextDef.nameKey) : null;
        return (
          <SeasonVictoryOverlay
            seasonName={tg(today.season.nameKey)}
            enemyName={tg(`enemy.${activeSeason?.enemy.key ?? 'saboteur'}.name`)}
            enemyKey={activeSeason?.enemy.key ?? 'saboteur'}
            daysCompleted={today.season.daysCompleted}
            streak={streak}
            nextSeasonName={nextName}
            conquered={tg('ui.victory.conquered', { days: today.season.daysCompleted })}
            peakStreak={tg('ui.victory.peakStreak', { streak })}
            enemyDefeated={tg('ui.victory.enemyDefeated', { enemy: tg(`enemy.${activeSeason?.enemy.key ?? 'saboteur'}.name`) })}
            nextTeaser={nextName ? tg('ui.victory.nextTeaser', { name: nextName }) : null}
            cta={nextName ? tg('ui.victory.cta', { name: nextName }) : tg('ui.victory.ctaFinal')}
            onClose={handleClaimVictory}
          />
        );
      })()}

      {nextSeasonKey && !victoryPending && (() => {
        const def = SEASONS_BY_KEY[nextSeasonKey];
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
            onClose={() => setNextSeasonKey(null)}
          />
        );
      })()}

      {expResult?.reward && (() => {
        const tier = expResult.reward.tier;
        const tierColor = tier === 'great' ? 'hsl(var(--accent))' : tier === 'good' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))';
        const discovery = expResult.discoveryKey ? DISCOVERIES_BY_KEY[expResult.discoveryKey] : null;
        const discoveryColor = discovery ? RARITY[discovery.rarity as RarityKey].color : undefined;
        return (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-background/85 p-4 backdrop-blur-md sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-3xl border border-accent/30 bg-card text-center"
              initial={{ y: 90, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con gradiente */}
              <div className="bg-gradient-to-b from-accent/15 to-transparent px-8 pb-4 pt-8">
                <motion.div
                  className="mb-3 text-7xl"
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: [0, 1.25, 0.95, 1], rotate: 0 }}
                  transition={{ duration: 0.65, ease: 'backOut' }}
                >
                  🎒
                </motion.div>
                <h2 className="text-xl font-extrabold">{th('expeditionReward.title')}</h2>
                <p className="mt-0.5 text-sm font-semibold" style={{ color: tierColor }}>
                  {th(`expeditionReward.tier_${tier}`)}
                </p>
              </div>

              {/* Materiales — staggered */}
              <div className="flex items-center justify-center gap-8 px-8 py-5">
                {([['🪵', expResult.reward.wood], ['🪨', expResult.reward.stone]] as const).map(([emoji, amount], i) => (
                  <motion.div
                    key={emoji}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.18, type: 'spring', stiffness: 280, damping: 20 }}
                  >
                    <span className="text-4xl">{emoji}</span>
                    <span className="text-xl font-extrabold">+{amount}</span>
                  </motion.div>
                ))}
              </div>

              {/* Descubrimiento — aparece con rareza coloreada */}
              {discovery && discoveryColor && (
                <motion.div
                  className="mx-5 mb-2 rounded-2xl border-2 p-4"
                  style={{ borderColor: `${discoveryColor}55`, backgroundColor: `${discoveryColor}12` }}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 18 }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: discoveryColor }}>
                    ✨ {th('expeditionReward.discovery')}
                  </p>
                  <motion.p
                    className="my-1 text-4xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.05, type: 'spring', stiffness: 300, damping: 16 }}
                  >
                    {discovery.emoji}
                  </motion.p>
                  <p className="text-sm font-semibold">{tg(`discoveries.${expResult.discoveryKey}.name`)}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: discoveryColor }}>
                    {tg(`rarity.${discovery.rarity}`)}
                  </p>
                </motion.div>
              )}

              {/* CTA */}
              <motion.button
                type="button"
                onClick={() => setExpResult(null)}
                className="mx-5 mb-6 mt-3 w-[calc(100%-2.5rem)] rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileTap={{ scale: 0.96 }}
              >
                {th('expeditionReward.close')}
              </motion.button>
            </motion.div>
          </motion.div>
        );
      })()}

      {storyChapter && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setStoryChapter(null)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="w-full max-w-sm rounded-3xl border border-primary/40 bg-card p-7"
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-center text-3xl">📖</p>
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-primary">
              {th('chapterReveal.label')}
            </p>
            <h2 className="mt-1 text-center text-lg font-bold">
              {tg(`story.${storyChapter}.title`)}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tg(`story.${storyChapter}.body`)}
            </p>
            <button
              type="button"
              onClick={() => setStoryChapter(null)}
              className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              {th('chapterReveal.continue')}
            </button>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
