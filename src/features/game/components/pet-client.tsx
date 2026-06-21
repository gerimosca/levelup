'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import { nextPetStageInfo, PET_ACTIVITY_EMOJI, PET_THOUGHTS, petActivityForHour } from '@/game-core';
import { getTodayStateAction } from '../game.actions';
import { PetStage } from './pet-stage';
import type { TodayState } from '../types';

function localDayDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function PetClient() {
  const tp = useTranslations('pet');
  const tg = useTranslations('game');
  const [pet, setPet] = useState<TodayState['pet'] | null>(null);

  useEffect(() => {
    getTodayStateAction(localDayDate()).then(({ state }) => {
      if (state) setPet(state.pet);
    });
  }, []);

  if (!pet) {
    return <p className="py-24 text-center text-sm text-muted-foreground">{tp('loading')}</p>;
  }

  const info = nextPetStageInfo(pet.careDays);
  const activity = pet.activity ?? petActivityForHour(new Date().getHours(), pet.mood);
  const thoughts = PET_THOUGHTS[pet.mood] ?? [];
  const thought = thoughts[pet.careDays % thoughts.length];

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{tp('title')}</h1>

      <div className="flex items-center justify-center rounded-3xl border border-border bg-card py-10">
        <PetStage stage={pet.stage} mood={pet.mood} size={120} activity={activity} />
      </div>

      <div>
        <p className="text-lg font-bold">{tg(`petStage.${pet.stage}`)}</p>
        <p className="text-sm text-muted-foreground">{tg(`petMood.${pet.mood}`)}</p>
      </div>

      {thought && (
        <div className="relative mx-auto w-fit max-w-[220px] rounded-2xl rounded-bl-none border border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground shadow-sm">
          {thought}
          <span className="absolute -bottom-3 left-4 text-xl leading-none" aria-hidden="true">💬</span>
        </div>
      )}

      {activity && (
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
          <span aria-hidden="true">{PET_ACTIVITY_EMOJI[activity]}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {tp('activityNow')}
          </span>
          <span className="text-sm">{tp(`activity.${activity}`)}</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground">{tp('careDays', { days: pet.careDays })}</p>

      {info.next ? (
        <div className="space-y-2">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${Math.round(info.progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {tp('nextStage', { days: info.remaining, stage: tg(`petStage.${info.next}`) })}
          </p>
        </div>
      ) : (
        <p className="text-sm font-semibold text-accent">{tp('maxStage')}</p>
      )}

      {/* Rol con impacto: escudos de racha */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-left">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
            {tp('shieldsLabel')}
          </span>
          <span className="flex gap-1">
            {Array.from({ length: pet.maxShields }).map((_, i) => (
              <Shield
                key={i}
                className="h-5 w-5"
                style={{ color: i < pet.shields ? '#6C5CE7' : 'hsl(var(--secondary))' }}
                fill={i < pet.shields ? '#6C5CE7' : 'transparent'}
                aria-hidden="true"
              />
            ))}
            {pet.maxShields === 0 && (
              <span className="text-xs text-muted-foreground">{tp('shieldsNone')}</span>
            )}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{tp('role')}</p>
      </section>
    </div>
  );
}
