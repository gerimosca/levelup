'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { ArrowLeft, Download, Trash2, Volume2, VolumeX, Sun, Moon, Monitor, Languages } from 'lucide-react';
import { HABIT_LIST, type HabitKey } from '@/game-core';
import { audio } from '@/shared/game';
import { NotificationSettings } from './notification-settings';
import {
  getTodayStateAction,
  saveActiveHabitsAction,
  exportDataAction,
  deleteDataAction,
  getEconomyAction,
  saveEconomyAction,
} from '../game.actions';

const MIN_HABITS = 3;

function localDayDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function SettingsClient() {
  const tset = useTranslations('settings');
  const tg = useTranslations('game');
  const locale = useLocale();
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [selected, setSelected] = useState<Set<HabitKey>>(new Set());
  const [sound, setSound] = useState(true);
  const [beerPrice, setBeerPrice] = useState(2.5);
  const [beersPerDay, setBeersPerDay] = useState(3);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getTodayStateAction(localDayDate()).then(({ state }) => {
      if (!state) return;
      setSelected(
        new Set<HabitKey>([
          state.missions.main.habit,
          ...state.missions.secondary.map((m) => m.habit),
        ]),
      );
    });
    getEconomyAction().then(({ economy }) => {
      if (economy) {
        setBeerPrice(economy.beerPrice);
        setBeersPerDay(economy.beersPerDay);
      }
    });
    if (typeof window !== 'undefined') {
      const on = localStorage.getItem('levelup_sound') !== 'off';
      setSound(on);
      audio.setEnabled(on);
    }
  }, []);

  const saveEconomy = async () => {
    setBusy(true);
    const res = await saveEconomyAction({ beerPrice, beersPerDay });
    setBusy(false);
    if (res.success) toast.success(tset('saved'));
  };

  const toggleHabit = (h: HabitKey) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(h)) next.delete(h);
      else next.add(h);
      return next;
    });

  const saveHabits = async () => {
    if (selected.size < MIN_HABITS) {
      toast.error(tset('minHabits', { count: MIN_HABITS }));
      return;
    }
    setBusy(true);
    const res = await saveActiveHabitsAction({ habits: [...selected] });
    setBusy(false);
    if (res.success) toast.success(tset('saved'));
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    audio.setEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('levelup_sound', next ? 'on' : 'off');
    }
  };

  const exportData = async () => {
    const { data } = await exportDataAction();
    if (!data || typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'levelup-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteData = async () => {
    setBusy(true);
    const res = await deleteDataAction();
    setBusy(false);
    if (res.success) {
      toast.success(tset('deleted'));
      router.push(`/${locale}/home`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors active:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">{tset('title')}</h1>
      </div>

      {/* Objetivos */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tset('objectives')}
        </h2>
        <p className="text-xs text-muted-foreground">{tset('objectivesHint')}</p>
        <div className="grid grid-cols-2 gap-2">
          {HABIT_LIST.map((h, i) => {
            const on = selected.has(h.key);
            const isLastOdd = i === HABIT_LIST.length - 1 && HABIT_LIST.length % 2 !== 0;
            return (
              <button
                key={h.key}
                type="button"
                onClick={() => toggleHabit(h.key)}
                aria-pressed={on}
                className={`min-h-[48px] rounded-xl border p-3 text-left text-sm font-medium ${
                  on ? 'border-primary bg-primary/15' : 'border-border bg-card text-muted-foreground'
                } ${isLastOdd ? 'col-span-2' : ''}`}
              >
                {tg(`habits.${h.key}.name`)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={saveHabits}
          disabled={busy}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
        >
          {tset('saveObjectives')}
        </button>
      </section>

      {/* Sonido */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tset('sound')}
        </h2>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={sound}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4"
        >
          <span className="inline-flex items-center gap-2 font-medium">
            {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            {sound ? tset('soundOn') : tset('soundOff')}
          </span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              sound ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                sound ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </section>

      {/* Apariencia */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tset('appearance')}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'light', icon: Sun,     label: tset('themeLight') },
            { value: 'system', icon: Monitor, label: tset('themeSystem') },
            { value: 'dark',  icon: Moon,    label: tset('themeDark') },
          ] as const).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className="flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-semibold transition-colors"
              style={{
                borderColor: theme === value ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                backgroundColor: theme === value ? 'hsl(var(--primary) / 0.12)' : undefined,
                color: theme === value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Dinero ahorrado — solo si el usuario tiene no_alcohol activo */}
      {selected.has('no_alcohol') && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {tset('savings')}
          </h2>
          <p className="text-xs text-muted-foreground">{tset('savingsHint')}</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="rounded-2xl border border-border bg-card p-3 text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">{tset('beerPrice')}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={beerPrice}
                  onChange={(e) => setBeerPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent text-lg font-bold focus:outline-none"
                />
                <span className="text-muted-foreground">€</span>
              </div>
            </label>
            <label className="rounded-2xl border border-border bg-card p-3 text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">{tset('beersPerDay')}</span>
              <input
                type="number"
                min={0}
                step={1}
                value={beersPerDay}
                onChange={(e) => setBeersPerDay(Math.max(0, Number(e.target.value)))}
                className="w-full bg-transparent text-lg font-bold focus:outline-none"
              />
            </label>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {tset('savingsPreview', {
              amount: Math.round(beerPrice * beersPerDay * 100) / 100,
            })}
          </p>
          <button
            type="button"
            onClick={saveEconomy}
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
          >
            {tset('saveSavings')}
          </button>
        </section>
      )}

      {/* Idioma */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tset('language')}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'en', label: tset('langEn') },
            { value: 'es', label: tset('langEs') },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                const segments = window.location.pathname.split('/');
                segments[1] = value;
                router.push(segments.join('/'));
              }}
              aria-pressed={locale === value}
              className="flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors"
              style={{
                borderColor: locale === value ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                backgroundColor: locale === value ? 'hsl(var(--primary) / 0.12)' : undefined,
                color: locale === value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Notificaciones */}
      <NotificationSettings />

      {/* Datos */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {tset('data')}
        </h2>
        <button
          type="button"
          onClick={exportData}
          className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card p-4 font-medium"
        >
          <Download className="h-5 w-5" />
          {tset('export')}
        </button>

        {confirmDelete ? (
          <div className="space-y-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">{tset('deleteWarning')}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-border py-2.5 font-semibold"
              >
                {tset('deleteCancel')}
              </button>
              <button
                type="button"
                onClick={deleteData}
                disabled={busy}
                className="flex-1 rounded-xl bg-destructive py-2.5 font-semibold text-destructive-foreground disabled:opacity-60"
              >
                {tset('deleteConfirm')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center gap-2 rounded-2xl border border-destructive/40 bg-card p-4 font-medium text-destructive"
          >
            <Trash2 className="h-5 w-5" />
            {tset('deleteTitle')}
          </button>
        )}
      </section>
    </div>
  );
}
