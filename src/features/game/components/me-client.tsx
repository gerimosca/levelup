'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Settings, Check, Zap, Lock, BarChart3 } from 'lucide-react';
import { RARITY, attributeRank, attributeRankBonus, dominantAttribute, ACHIEVEMENTS_BY_KEY, TITLES_BY_KEY, MASTERY_MILESTONES, type RarityKey } from '@/game-core';
import { usePlayerStore, audio, haptics } from '@/shared/game';
import { getProfileAction, equipItemAction, updateAvatarConfigAction, setActiveTitleAction } from '../game.actions';
import { CharacterStage } from './character-stage';
import { AttributeBar } from './attribute-bar';
import { ShareProgress } from './share-progress';
import type { AvatarConfig, EquipmentView, ProfileView, SkinKey, HairKey } from '../types';
import { SKIN_TONES, HAIR_COLORS } from '../types';

const ACHIEVEMENT_GROUPS = [
  { key: 'first',  emoji: '⭐', keys: ['first_training', 'first_clean_day', 'perfect_week'] },
  { key: 'streak', emoji: '🔥', keys: ['streak_7', 'streak_21', 'streak_30', 'streak_50', 'streak_100', 'streak_365'] },
  { key: 'clean',  emoji: '🧊', keys: ['clean_7', 'clean_30', 'clean_100'] },
  { key: 'volume', emoji: '💪', keys: ['trainings_100', 'km_50', 'reads_100'] },
  { key: 'level',  emoji: '⚡', keys: ['level_5', 'level_10', 'level_25', 'level_50'] },
  { key: 'season', emoji: '🏆', keys: ['season_1_done', 'season_2_done', 'season_3_done', 'all_seasons'] },
] as const;

const TOTAL_ACHIEVEMENTS = ACHIEVEMENT_GROUPS.reduce((n, g) => n + g.keys.length, 0);

const ATTR_COLOR: Record<string, string> = {
  vitality: '#2ECC71',
  strength: '#FF7A45',
  discipline: '#6C5CE7',
  energy: '#4AC4F0',
  resistance: '#FFD24A',
};

const SLOT_ORDER = ['head', 'back', 'chest', 'hands', 'feet', 'accessory'];

const SLOT_EMOJI: Record<string, string> = {
  head: '🪖', back: '🪬', chest: '🛡️', hands: '⚔️', feet: '👢', accessory: '💎',
};

export function MeClient() {
  const tm = useTranslations('me');
  const tg = useTranslations('game');
  const locale = useLocale();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({});
  const playerLevel = usePlayerStore((s) => s.level);
  const streak = usePlayerStore((s) => s.streak);

  const reload = useCallback(() => {
    getProfileAction().then(({ profile }) => {
      if (profile) {
        setProfile(profile);
        setAvatarConfig(profile.avatarConfig ?? {});
      }
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const equip = async (key: string) => {
    const res = await equipItemAction(key);
    if (res.success) {
      audio.play('claim');
      haptics.trigger('success');
      reload();
    } else {
      toast.error(tg('ui.genericError'));
    }
  };

  const [heroNameInput, setHeroNameInput] = useState('');
  const [nameEditing, setNameEditing] = useState(false);

  useEffect(() => {
    setHeroNameInput(avatarConfig.heroName ?? '');
  }, [avatarConfig.heroName]);

  const pickSkin = async (skinKey: SkinKey) => {
    const next: AvatarConfig = { ...avatarConfig, skinKey };
    setAvatarConfig(next);
    haptics.trigger('light');
    await updateAvatarConfigAction(next);
  };

  const pickHair = async (hairKey: HairKey) => {
    const next: AvatarConfig = { ...avatarConfig, hairKey };
    setAvatarConfig(next);
    haptics.trigger('light');
    await updateAvatarConfigAction(next);
  };

  const saveHeroName = async () => {
    const heroName = heroNameInput.trim().slice(0, 20) || undefined;
    const next: AvatarConfig = { ...avatarConfig, heroName };
    setAvatarConfig(next);
    setNameEditing(false);
    haptics.trigger('success');
    toast.success(tm('nameSaved'));
    await updateAvatarConfigAction(next);
  };

  const pickTitle = async (titleKey: string) => {
    const isActive = avatarConfig.activeTitle === titleKey;
    const next: AvatarConfig = { ...avatarConfig, activeTitle: isActive ? undefined : titleKey };
    setAvatarConfig(next);
    haptics.trigger('light');
    await setActiveTitleAction(isActive ? null : titleKey);
    reload();
  };

  if (!profile) {
    return <p className="py-24 text-center text-sm text-muted-foreground">{tm('loading')}</p>;
  }

  // Atributo dominante → aura + título en el showcased del héroe
  const attrMap = Object.fromEntries(profile.attributes.map((a) => [a.type, a.points]));
  const dominant = dominantAttribute(attrMap);
  const dominantRank = dominant ? attributeRank(dominant.points) : 0;
  const auraColor = dominant && dominantRank >= 3 ? ATTR_COLOR[dominant.key] : undefined;
  const auraStrength = dominantRank >= 7 ? 'strong' : dominantRank >= 5 ? 'medium' : 'subtle';
  const attrTierKey = dominantRank >= 7 ? 'master' : dominantRank >= 5 ? 'bearer' : 'initiate';
  const titleText =
    auraColor && dominant
      ? `${tm(`attrTitle.${attrTierKey}`)} ${tg(`attributes.${dominant.key}`)}`
      : undefined;

  const renderItem = (e: EquipmentView) => {
    const r = RARITY[e.rarity as RarityKey];
    const isLegendary = e.rarity === 'legendary';
    return (
      <div key={e.key} className="relative">
        {isLegendary && e.unlocked && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ border: `2px solid ${r.color}`, borderRadius: '1rem' }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <button
          type="button"
          disabled={!e.unlocked}
          onClick={() => equip(e.key)}
          className="relative w-full rounded-2xl border-2 bg-card p-3 text-left transition-transform active:scale-95 disabled:cursor-default"
          style={{
            borderColor: e.unlocked ? r.color : 'hsl(var(--border))',
            boxShadow: e.equipped ? `0 0 20px ${r.glow}` : undefined,
            opacity: e.unlocked ? 1 : 0.55,
          }}
        >
          <div className="mb-2 text-center text-3xl" aria-hidden="true">
            {SLOT_EMOJI[e.slot] ?? '📦'}
          </div>
          <span className="flex items-center justify-between">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: `${r.color}26`, color: r.color }}
            >
              {tg(`rarity.${e.rarity}`)}
            </span>
            {e.equipped ? (
              <Check className="h-4 w-4 shrink-0" style={{ color: r.color }} aria-hidden="true" />
            ) : !e.unlocked ? (
              <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            ) : null}
          </span>
          <p className="mt-1.5 text-sm font-semibold leading-tight">
            {tg(`equipment.${e.key}.name`)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {e.equipped ? tm('equipped') : e.unlocked ? tm('equip') : `🔒 ${tg(e.unlockKey)}`}
          </p>
        </button>
      </div>
    );
  };

  const bySlot = SLOT_ORDER.map((slot) => ({
    slot,
    items: profile.equipment.filter((e) => e.slot === slot),
  })).filter((g) => g.items.length > 0);

  // Top 3 locked achievement items sorted by rarity desc (legendary first)
  const nextUnlocks = profile.equipment
    .filter((e) => !e.unlocked && e.source === 'achievement')
    .sort((a, b) => RARITY[b.rarity as RarityKey].order - RARITY[a.rarity as RarityKey].order)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{tm('title')}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/stats`}
            aria-label={tm('statsLink')}
            className="rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href={`/${locale}/settings`}
            aria-label={tm('settings')}
            className="rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Escaparate del héroe */}
      <section
        className="relative overflow-hidden rounded-3xl border border-border p-6"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%), hsl(var(--card))',
        }}
      >
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-sm font-bold text-accent">
          <Zap className="h-4 w-4" aria-hidden="true" />
          {profile.power}
        </div>
        <CharacterStage
          tier={profile.tier}
          tierLabel={tg(`tiers.${profile.tier}`)}
          levelLabel={tm('levelLabel', { level: profile.level })}
          equipped={profile.equipped}
          avatarConfig={avatarConfig}
          size="xl"
          auraColor={auraColor}
          auraStrength={auraStrength}
          titleText={titleText}
        />
        {/* pedestal */}
        <div className="mx-auto mt-2 h-2 w-32 rounded-full bg-foreground/10 blur-[1px]" />
      </section>

      {/* Apariencia */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tm('appearance.title')}
        </h2>

        {/* Nombre del héroe */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{tm('appearance.nameLabel')}</p>
          {nameEditing ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={heroNameInput}
                onChange={(e) => setHeroNameInput(e.target.value.slice(0, 20))}
                onKeyDown={(e) => { if (e.key === 'Enter') saveHeroName(); if (e.key === 'Escape') setNameEditing(false); }}
                placeholder={tm('appearance.namePlaceholder')}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                maxLength={20}
              />
              <button type="button" onClick={saveHeroName} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {tm('appearance.nameSave')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNameEditing(true)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition-colors active:bg-primary/10"
            >
              <span className={avatarConfig.heroName ? 'font-semibold' : 'text-muted-foreground'}>
                {avatarConfig.heroName ?? tm('appearance.nameEmpty')}
              </span>
              <span className="text-xs text-muted-foreground">{tm('appearance.nameEdit')}</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{tm('appearance.skinLabel')}</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(SKIN_TONES) as SkinKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pickSkin(key)}
                className="h-9 w-9 rounded-full transition-transform active:scale-90"
                style={{
                  backgroundColor: SKIN_TONES[key],
                  boxShadow:
                    (avatarConfig.skinKey ?? 'light') === key
                      ? `0 0 0 3px hsl(var(--background)), 0 0 0 5px ${SKIN_TONES[key]}`
                      : undefined,
                }}
                aria-label={key}
                aria-pressed={(avatarConfig.skinKey ?? 'light') === key}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{tm('appearance.hairLabel')}</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(HAIR_COLORS) as HairKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pickHair(key)}
                className="h-9 w-9 rounded-full transition-transform active:scale-90"
                style={{
                  backgroundColor: HAIR_COLORS[key],
                  border: key === 'white' ? '2px solid hsl(var(--border))' : undefined,
                  boxShadow:
                    (avatarConfig.hairKey ?? 'brown') === key
                      ? `0 0 0 3px hsl(var(--background)), 0 0 0 5px ${HAIR_COLORS[key]}`
                      : undefined,
                }}
                aria-label={key}
                aria-pressed={(avatarConfig.hairKey ?? 'brown') === key}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Equipo por ranura */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tm('equipmentTitle')}
        </h2>
        {bySlot.map(({ slot, items }) => (
          <div key={slot} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{tm(`slots.${slot}`)}</p>
            <div className="grid grid-cols-2 gap-2">{items.map(renderItem)}</div>
          </div>
        ))}

        {/* Próximos desbloqueos */}
        {nextUnlocks.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tm('nextUnlocksTitle')}
            </p>
            <div className="space-y-2">
              {nextUnlocks.map((e) => {
                const r = RARITY[e.rarity as RarityKey];
                return (
                  <div
                    key={e.key}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {SLOT_EMOJI[e.slot] ?? '📦'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                          style={{ backgroundColor: `${r.color}26`, color: r.color }}
                        >
                          {tg(`rarity.${e.rarity}`)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tm(`slots.${e.slot}`)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold">
                        {tg(`equipment.${e.key}.name`)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{tg(e.unlockKey)}</p>
                    </div>
                    <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Atributos — panel de maestría */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tm('attributesTitle')}
        </h2>
        <p className="text-xs text-muted-foreground">{tm('attributesHint')}</p>
        <div className="space-y-3">
          {profile.attributes.map((a) => {
            const color = ATTR_COLOR[a.type] ?? '#6C5CE7';
            const nextMilestone = MASTERY_MILESTONES.find((m) => m.rank > a.rank);
            const progressPct = Math.round(a.progress * 100);
            return (
              <div
                key={a.type}
                className="rounded-2xl border border-border bg-card p-4 space-y-3"
              >
                {/* Cabecera */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm">{tg(`attributes.${a.type}`)}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{tm(`attrHint.${a.type}`)}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}22`, color }}
                    >
                      {tm('rank', { rank: a.rank })}
                    </span>
                    {a.rank > 1 && (
                      <p className="text-xs mt-0.5 font-medium" style={{ color }}>
                        +{Math.round((attributeRankBonus(a.rank) - 1) * 100)}% {tm('rankBonusLabel')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Barra de progreso al siguiente rango */}
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, background: color }}
                    />
                  </div>
                  {nextMilestone && (
                    <p className="text-xs text-muted-foreground text-right">
                      {progressPct}% → {tm('rank', { rank: nextMilestone.rank })}
                    </p>
                  )}
                </div>

                {/* Hitos de maestría */}
                <div className="space-y-1.5 pt-1 border-t border-border">
                  {MASTERY_MILESTONES.map((m) => {
                    const unlocked = a.rank >= m.rank;
                    const isNext = !unlocked && m === nextMilestone;
                    return (
                      <div
                        key={m.rank}
                        className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 transition-colors ${
                          unlocked
                            ? 'text-foreground'
                            : isNext
                            ? 'text-muted-foreground bg-muted/40'
                            : 'text-muted-foreground/50'
                        }`}
                      >
                        <span className={`text-sm leading-none ${!unlocked && !isNext ? 'opacity-30' : ''}`}>
                          {m.icon}
                        </span>
                        <span className="font-medium tabular-nums w-14 shrink-0">
                          {tm('rank', { rank: m.rank })}
                        </span>
                        <span className="flex-1">{tg(`mastery.effect.${m.effectKey}`)}</span>
                        {unlocked && (
                          <span style={{ color }} className="font-bold text-xs shrink-0">✓</span>
                        )}
                        {isNext && (
                          <span className="text-muted-foreground text-xs shrink-0">→</span>
                        )}
                        {!unlocked && !isNext && (
                          <span className="text-muted-foreground/30 text-xs shrink-0">🔒</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Logros */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {tm('achievementsTitle')}
          </h2>
          <span className="text-xs font-bold text-muted-foreground">
            {tm('achievementsProgress', { unlocked: profile.achievements.length, total: TOTAL_ACHIEVEMENTS })}
          </span>
        </div>
        {ACHIEVEMENT_GROUPS.map(({ key, emoji, keys }) => {
          const unlocked = new Set(profile.achievements);
          const groupCount = keys.filter((k) => unlocked.has(k)).length;
          return (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {emoji} {tm(`achievementGroup.${key}`)}
                <span className="ml-1.5 font-normal opacity-60">
                  {groupCount}/{keys.length}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {keys.map((aKey) => {
                  const done = unlocked.has(aKey);
                  const def = ACHIEVEMENTS_BY_KEY[aKey];
                  const prog = !done && def?.progress ? def.progress(profile.achievementStats) : null;
                  const pct = prog ? Math.round((prog.current / prog.target) * 100) : 0;
                  const hint = !done ? tg.rich(`achievements.${aKey}.hint`, {
                    current: prog?.current ?? 0,
                    target: prog?.target ?? 1,
                  }) : null;
                  return (
                    <motion.div
                      key={aKey}
                      layout
                      className="flex flex-col gap-1.5 rounded-xl border px-3 py-2.5"
                      style={{
                        borderColor: done ? '#6C5CE7' : 'hsl(var(--border))',
                        backgroundColor: done ? 'rgba(108,92,231,0.08)' : 'hsl(var(--card))',
                        opacity: done ? 1 : 0.7,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-sm" aria-hidden="true">
                          {done ? '🏅' : '🔒'}
                        </span>
                        <span
                          className="text-xs font-medium leading-tight"
                          style={{ color: done ? '#6C5CE7' : 'hsl(var(--muted-foreground))' }}
                        >
                          {tg(`achievements.${aKey}.name`)}
                        </span>
                      </div>
                      {!done && hint && (
                        <p className="text-[10px] leading-tight text-muted-foreground/60">{hint}</p>
                      )}
                      {prog && (
                        <div className="h-1 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-primary/50 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Títulos de héroe ─────────────────────────────────────── */}
      {profile.earnedTitles.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <span aria-hidden="true">👑</span>
            {tm('titlesTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">{tm('titlesHint')}</p>
          <div className="flex flex-wrap gap-2">
            {profile.earnedTitles.map((key) => {
              const def = TITLES_BY_KEY[key];
              if (!def) return null;
              const isActive = avatarConfig.activeTitle === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickTitle(key)}
                  className="rounded-full border px-3 py-1.5 text-sm font-semibold transition-all active:scale-95"
                  style={{
                    borderColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    backgroundColor: isActive ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--card))',
                    color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                    boxShadow: isActive ? '0 0 10px hsl(var(--primary) / 0.4)' : undefined,
                  }}
                  aria-pressed={isActive}
                >
                  {tg(`titles.${key}`)}
                  {isActive && <span className="ml-1 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <ShareProgress
        streak={streak}
        level={playerLevel.level}
        tierLabel={tg(`tiers.${profile.tier}`)}
        achievedCount={profile.achievements.length}
        totalCount={TOTAL_ACHIEVEMENTS}
      />
    </div>
  );
}
