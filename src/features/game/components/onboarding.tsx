'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HABIT_LIST, type HabitKey } from '@/game-core';
import { saveActiveHabitsAction, updateAvatarConfigAction } from '../game.actions';
import { subscribePushAction } from '../push.actions';
import { CharacterStage } from './character-stage';
import { SKIN_TONES, HAIR_COLORS } from '../types';
import type { AvatarConfig, SkinKey, HairKey } from '../types';
import type { SerializedPushSubscription } from '../push.types';

const MIN_HABITS = 3;

const HABIT_EMOJI: Record<string, string> = {
  no_alcohol: '🌿',
  train: '🏋️',
  sleep: '🌙',
  steps: '👣',
  eat_well: '🥗',
  read: '📖',
  water: '💧',
  meditate: '🧘',
};

const ATTR_COLOR: Record<string, string> = {
  vitality: '#2ECC71',
  strength: '#FF7A45',
  discipline: '#6C5CE7',
  energy: '#4AC4F0',
  resistance: '#FFD24A',
};

const SLIDE = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.26 } },
  exit: { opacity: 0, x: -28, transition: { duration: 0.18 } },
};

const PILLARS = ['habits', 'xp', 'hero'] as const;
const PILLAR_ICON: Record<string, string> = { habits: '✅', xp: '⚡', hero: '⚔️' };

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer;
}

function localToUtcHour(localHour: number): number {
  const offset = new Date().getTimezoneOffset();
  return ((localHour + offset / 60) % 24 + 24) % 24;
}

function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const tg = useTranslations('game');
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selected, setSelected] = useState<Set<HabitKey>>(new Set());
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({});
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);

  // Hero celebrates when first shown
  useEffect(() => {
    const t = setTimeout(() => setCelebrateKey((k) => k + 1), 350);
    return () => clearTimeout(t);
  }, []);

  const toggle = (h: HabitKey) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(h)) next.delete(h);
      else next.add(h);
      return next;
    });

  const pickSkin = (skinKey: SkinKey) => {
    setAvatarConfig((prev) => ({ ...prev, skinKey }));
    setCelebrateKey((k) => k + 1);
  };

  const pickHair = (hairKey: HairKey) => {
    setAvatarConfig((prev) => ({ ...prev, hairKey }));
    setCelebrateKey((k) => k + 1);
  };

  const submit = async () => {
    if (selected.size < MIN_HABITS || saving) return;
    setSaving(true);
    await Promise.all([
      saveActiveHabitsAction({ habits: [...selected] }),
      updateAvatarConfigAction(avatarConfig),
    ]);
    setSaving(false);
    // Go to notification opt-in if supported, else finish
    if (pushSupported() && Notification.permission !== 'denied') {
      setStep(5);
    } else {
      onDone();
    }
  };

  const enableNotifications = async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) { onDone(); return; }
    setNotifBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        const sub = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        await subscribePushAction(
          sub.toJSON() as SerializedPushSubscription,
          localToUtcHour(20),
        );
      }
    } catch {
      // non-critical — user can enable from settings later
    } finally {
      setNotifBusy(false);
    }
    onDone();
  };

  const sortedSelected = HABIT_LIST.filter((h) => selected.has(h.key)).sort(
    (a, b) => b.baseXp - a.baseXp,
  );
  const mainMission = sortedSelected[0];
  const secondaryMissions = sortedSelected.slice(1);

  return (
    <div className="py-4">
      {/* Progress dots */}
      <div className="mb-8 flex justify-center gap-2">
        {([1, 2, 3, 4, 5] as const).map((s) => (
          <div
            key={s}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: s === step ? '2rem' : '1.5rem',
              backgroundColor:
                s <= step ? 'hsl(var(--primary))' : 'hsl(var(--border))',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Welcome ─────────────────────────────── */}
        {step === 1 && (
          <motion.div key="s1" {...SLIDE} className="space-y-6 text-center">
            <div className="flex justify-center">
              <CharacterStage
                tier="initiate"
                tierLabel={tg('tiers.initiate')}
                levelLabel="Level 1"
                size="xl"
                avatarConfig={avatarConfig}
                celebrateKey={celebrateKey}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {tg('onboarding.step1.title')}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {tg('onboarding.step1.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PILLARS.map((k) => (
                <div key={k} className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-2xl">
                    {PILLAR_ICON[k]}
                  </div>
                  <p className="text-xs font-medium leading-tight">
                    {tg(`onboarding.step1.pillar.${k}`)}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-transform active:scale-95"
            >
              {tg('onboarding.step1.cta')}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Habit picker ─────────────────────────── */}
        {step === 2 && (
          <motion.div key="s2" {...SLIDE} className="space-y-5">
            <div className="text-center">
              <h1 className="text-xl font-bold">{tg('onboarding.step2.title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {selected.size < MIN_HABITS
                  ? tg('onboarding.step2.hint', { count: MIN_HABITS - selected.size })
                  : tg('onboarding.step2.hintDone', { count: selected.size })}
              </p>
            </div>

            {(() => {
              const canPreview = selected.size >= MIN_HABITS;
              const mainKey = canPreview
                ? HABIT_LIST.filter((h) => selected.has(h.key)).sort((a, b) => b.baseXp - a.baseXp)[0]?.key
                : null;
              return (
                <div className="grid grid-cols-2 gap-3">
                  {HABIT_LIST.map((h) => {
                    const on = selected.has(h.key);
                    const isMain = on && h.key === mainKey;
                    const color = ATTR_COLOR[h.attribute] ?? 'hsl(var(--primary))';
                    return (
                      <button
                        key={h.key}
                        type="button"
                        onClick={() => toggle(h.key)}
                        aria-pressed={on}
                        className="relative rounded-2xl border-2 bg-card p-4 text-left transition-all active:scale-95"
                        style={{
                          borderColor: isMain ? 'hsl(var(--accent))' : on ? color : 'hsl(var(--border))',
                          backgroundColor: isMain ? 'hsl(var(--accent) / 0.1)' : on ? `${color}18` : undefined,
                        }}
                      >
                        {isMain && (
                          <span className="absolute right-2 top-2 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground">
                            {tg('ui.mainBadge')}
                          </span>
                        )}
                        <div className="mb-1.5 text-2xl" aria-hidden="true">
                          {HABIT_EMOJI[h.key] ?? '⭐'}
                        </div>
                        <p className="text-sm font-semibold leading-tight">
                          {tg(`habits.${h.key}.name`)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {tg(`habits.${h.key}.tagline`)}
                        </p>
                        <div
                          className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: `${color}22`, color }}
                        >
                          +{h.baseXp} XP
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={selected.size < MIN_HABITS}
                onClick={() => setStep(3)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
              >
                {tg('onboarding.step2.cta')}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Mission preview ──────────────────────── */}
        {step === 3 && (
          <motion.div key="s3" {...SLIDE} className="space-y-5">
            <div className="text-center">
              <h1 className="text-xl font-bold">{tg('onboarding.step3.title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {tg('onboarding.step3.subtitle')}
              </p>
            </div>

            {mainMission && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {tg('onboarding.step3.mainLabel')}
                </p>
                <div className="rounded-2xl border-2 border-accent bg-accent/10 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {HABIT_EMOJI[mainMission.key] ?? '⭐'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{tg(`habits.${mainMission.key}.name`)}</p>
                      <p className="text-xs text-muted-foreground">
                        {tg('onboarding.step3.mainHint')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-accent">+{mainMission.baseXp} XP</span>
                  </div>
                </div>
              </div>
            )}

            {secondaryMissions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {tg('onboarding.step3.secondaryLabel')}
                </p>
                <div className="space-y-2">
                  {secondaryMissions.map((h) => (
                    <div
                      key={h.key}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <span className="text-xl" aria-hidden="true">
                        {HABIT_EMOJI[h.key] ?? '⭐'}
                      </span>
                      <p className="flex-1 text-sm font-medium">{tg(`habits.${h.key}.name`)}</p>
                      <span className="text-xs font-semibold text-muted-foreground">
                        +{h.baseXp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              {tg('onboarding.step3.enemyHint')}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95"
              >
                {tg('onboarding.step3.cta')}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Avatar customization ─────────────────── */}
        {step === 4 && (
          <motion.div key="s4" {...SLIDE} className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-bold">{tg('onboarding.step4.title')}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {tg('onboarding.step4.subtitle')}
              </p>
            </div>

            <div className="flex justify-center">
              <CharacterStage
                tier="initiate"
                tierLabel={tg('tiers.initiate')}
                levelLabel="Level 1"
                size="xl"
                avatarConfig={avatarConfig}
                celebrateKey={celebrateKey}
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  {tg('onboarding.step4.skinLabel')}
                </p>
                <div className="flex gap-3">
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

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  {tg('onboarding.step4.hairLabel')}
                </p>
                <div className="flex gap-3">
                  {(Object.keys(HAIR_COLORS) as HairKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => pickHair(key)}
                      className="h-9 w-9 rounded-full transition-transform active:scale-90"
                      style={{
                        backgroundColor: HAIR_COLORS[key],
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
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={submit}
                className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
              >
                {saving ? '…' : tg('onboarding.step4.cta')}
              </button>
            </div>
          </motion.div>
        )}
        {/* ── Step 5: Notification opt-in ─────────────────── */}
        {step === 5 && (
          <motion.div key="s5" {...SLIDE} className="space-y-8 text-center">
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/15 text-5xl">
                🔔
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {tg('onboarding.step5.title')}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {tg('onboarding.step5.subtitle')}
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={enableNotifications}
                disabled={notifBusy}
                className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
              >
                {notifBusy ? '…' : tg('onboarding.step5.cta')}
              </button>
              <button
                type="button"
                onClick={onDone}
                className="w-full rounded-xl py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {tg('onboarding.step5.skip')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
