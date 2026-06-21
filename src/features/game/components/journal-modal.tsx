'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { JOURNAL_XP_BONUS } from '@/game-core';
import { saveJournalAction } from '../game.actions';

const MOOD_EMOJIS = ['😭', '😕', '😐', '🙂', '😄'] as const;

function localDayDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function JournalModal({ onClose }: { onClose: () => void }) {
  const th = useTranslations('home');
  const [mood, setMood] = useState<string | null>(null);
  const [felt, setFelt] = useState('');
  const [learned, setLearned] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await saveJournalAction({
      dayDate: localDayDate(),
      mood: mood ?? undefined,
      felt,
      learned,
    });
    setSaving(false);
    if (res.success) {
      toast.success(th('journal.saved', { xp: res.xpAwarded }));
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="w-full max-w-md overflow-hidden rounded-t-3xl border border-border bg-card pb-safe"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="space-y-5 px-5 pb-6 pt-2">
          <h2 className="text-center text-lg font-bold">{th('journalCta')}</h2>

          {/* Mood picker */}
          <div>
            <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
              {th('journal.moodLabel')}
            </p>
            <div className="flex justify-center gap-3">
              {MOOD_EMOJIS.map((emoji, i) => {
                const key = String(i + 1);
                const active = mood === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(active ? null : key)}
                    aria-pressed={active}
                    aria-label={th(`journal.moods.${key}`)}
                    className="flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 transition-all active:scale-90"
                    style={{
                      borderColor: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                      backgroundColor: active ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                    }}
                  >
                    <span className="text-2xl leading-none">{emoji}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {th(`journal.moods.${key}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Felt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {th('journal.feltLabel')}
            </label>
            <textarea
              value={felt}
              onChange={(e) => setFelt(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={th('journal.feltPlaceholder')}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Learned */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {th('journal.learnedLabel')}
            </label>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={th('journal.learnedPlaceholder')}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors active:bg-secondary"
            >
              {th('journal.skip')}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
            >
              {th('journal.save', { xp: JOURNAL_XP_BONUS })}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
