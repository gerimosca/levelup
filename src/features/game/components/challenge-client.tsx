'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Copy, Check, Flame, LogOut, Plus, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { SEASONS_BY_KEY } from '@/game-core';
import { audio, haptics } from '@/shared/game';
import {
  getChallengeAction,
  createChallengeAction,
  joinChallengeAction,
  leaveChallengeAction,
} from '../challenge.actions';
import type { ChallengeView } from '../types';

function localDayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Member card ──────────────────────────────────────────────────────────────

function MemberCard({
  member,
  tg,
  tc,
}: {
  member: ChallengeView['members'][number];
  tg: ReturnType<typeof useTranslations>;
  tc: ReturnType<typeof useTranslations>;
}) {
  const seasonDef = SEASONS_BY_KEY[member.seasonKey];
  const seasonName = seasonDef ? tg(seasonDef.nameKey) : member.seasonKey;

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
        member.loggedToday
          ? 'border-primary/40 bg-primary/6'
          : 'border-border bg-card'
      }`}
    >
      {/* Avatar */}
      {member.avatarUrl ? (
        <img
          src={member.avatarUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
          style={{
            outline: member.loggedToday ? '2px solid hsl(var(--primary))' : undefined,
            outlineOffset: '2px',
          }}
        />
      ) : (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{
            background: member.loggedToday
              ? 'hsl(var(--primary))'
              : 'hsl(var(--secondary))',
            color: member.loggedToday
              ? 'hsl(var(--primary-foreground))'
              : 'hsl(var(--muted-foreground))',
          }}
        >
          {member.displayName[0].toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">
            {member.displayName}
            {member.isMe && (
              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                ({tc('you')})
              </span>
            )}
          </p>
          {member.loggedToday && (
            <span className="shrink-0 text-xs font-bold text-primary">
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {seasonName} · {tc('day', { n: member.daysCompleted })} · {tc('level', { n: member.level })}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <div className="inline-flex items-center gap-1 text-sm font-bold text-accent">
          <Flame className="h-3.5 w-3.5" />
          {member.streak}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty state: create or join ───────────────────────────────────────────────

function NoChallenge({
  tc,
  onCreated,
  onJoined,
}: {
  tc: ReturnType<typeof useTranslations>;
  onCreated: () => void;
  onJoined: () => void;
}) {
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== 'idle') inputRef.current?.focus();
  }, [mode]);

  const handleCreate = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    const res = await createChallengeAction(value);
    setBusy(false);
    if (!res.success) { toast.error(tc(`error.${res.error ?? 'generic'}`)); return; }
    audio.play('levelUp');
    haptics.trigger('success');
    toast.success(tc('created'));
    onCreated();
  };

  const handleJoin = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    const res = await joinChallengeAction(value);
    setBusy(false);
    if (!res.success) { toast.error(tc(`error.${res.error ?? 'generic'}`)); return; }
    audio.play('chest');
    haptics.trigger('success');
    toast.success(tc('joined'));
    onJoined();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 text-5xl">⚔️</div>
        <h2 className="text-lg font-bold">{tc('emptyTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{tc('emptySubtitle')}</p>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              type="button"
              onClick={() => setMode('create')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 font-semibold transition-colors active:bg-primary/10"
            >
              <Plus className="h-6 w-6 text-primary" />
              <span className="text-sm">{tc('createBtn')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 font-semibold transition-colors active:bg-primary/10"
            >
              <Hash className="h-6 w-6 text-accent" />
              <span className="text-sm">{tc('joinBtn')}</span>
            </button>
          </motion.div>
        )}

        {mode === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder={tc('createPlaceholder')}
              maxLength={40}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!value.trim() || busy}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? '…' : tc('createConfirm')}
            </button>
            <button type="button" onClick={() => { setMode('idle'); setValue(''); }} className="w-full py-2 text-sm text-muted-foreground">
              {tc('cancel')}
            </button>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder={tc('codePlaceholder')}
              maxLength={6}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center font-mono text-lg font-bold tracking-widest outline-none focus:border-primary uppercase"
            />
            <button
              type="button"
              onClick={handleJoin}
              disabled={value.length < 6 || busy}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold disabled:opacity-50"
              style={{ color: 'hsl(218 22% 7%)' }}
            >
              {busy ? '…' : tc('joinConfirm')}
            </button>
            <button type="button" onClick={() => { setMode('idle'); setValue(''); }} className="w-full py-2 text-sm text-muted-foreground">
              {tc('cancel')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Challenge view ────────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  tc,
  tg,
  onLeft,
}: {
  challenge: ChallengeView;
  tc: ReturnType<typeof useTranslations>;
  tg: ReturnType<typeof useTranslations>;
  onLeft: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(challenge.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast(tc('copyFallback', { code: challenge.inviteCode }));
    }
  };

  const handleLeave = async () => {
    if (!confirmLeave) { setConfirmLeave(true); return; }
    setLeaving(true);
    const res = await leaveChallengeAction(challenge.id);
    setLeaving(false);
    if (!res.success) {
      toast.error(tc('error.generic'));
      return;
    }
    toast(tc('leftChallenge'));
    onLeft();
  };

  const todayCount = challenge.members.filter((m) => m.loggedToday).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold leading-tight">{challenge.name}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {tc('memberCount', { n: challenge.members.length })} · {todayCount}/{challenge.members.length} {tc('loggedToday')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLeave}
            disabled={leaving}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              confirmLeave
                ? 'bg-destructive/15 text-destructive'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {confirmLeave ? tc('confirmLeave') : <LogOut className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Invite code */}
        <button
          type="button"
          onClick={copyCode}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-2.5 transition-colors active:bg-primary/10"
        >
          <span className="text-xs text-muted-foreground">{tc('inviteCode')}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-widest">{challenge.inviteCode}</span>
            {copied
              ? <Check className="h-3.5 w-3.5 text-primary" />
              : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            }
          </div>
        </button>
      </div>

      {/* Members */}
      <div className="space-y-2">
        {challenge.members.map((member) => (
          <MemberCard key={member.userId} member={member} tg={tg} tc={tc} />
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ChallengeClient() {
  const tc = useTranslations('challenge');
  const tg = useTranslations('game');
  const [challenge, setChallenge] = useState<ChallengeView | null | undefined>(undefined);

  const load = useCallback(() => {
    getChallengeAction(localDayDate()).then(({ challenge: c }) => setChallenge(c));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (challenge === undefined) {
    return <p className="py-24 text-center text-sm text-muted-foreground">{tc('loading')}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{tc('title')}</h1>
      {challenge === null
        ? <NoChallenge tc={tc} onCreated={load} onJoined={load} />
        : <ChallengeCard challenge={challenge} tc={tc} tg={tg} onLeft={load} />
      }
    </div>
  );
}
