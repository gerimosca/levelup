'use client';

import { Check, Loader2, RefreshCw } from 'lucide-react';
import type { MissionView } from '../types';

/** Tarjeta de misión con botón de reclamar y, opcionalmente, reroll. */
export function MissionCard({
  mission,
  label,
  claimLabel,
  claimedLabel,
  mainBadge,
  claiming,
  onClaim,
  rerollCost,
  rerolling,
  canReroll,
  onReroll,
  rerollLabel,
}: {
  mission: MissionView;
  label: string;
  claimLabel: string;
  claimedLabel: string;
  mainBadge?: string;
  claiming: boolean;
  onClaim: () => void;
  rerollCost?: number;
  rerolling?: boolean;
  canReroll?: boolean;
  onReroll?: () => void;
  rerollLabel?: string;
}) {
  const isMain = mission.kind === 'main';
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isMain ? 'border-primary/40 bg-primary/10' : 'border-border bg-card'
      } ${mission.claimed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {isMain && mainBadge && (
            <span className="mb-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {mainBadge}
            </span>
          )}
          <p className="truncate font-medium">{label}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/20 px-2 py-1 text-xs font-bold text-accent">
          +{mission.xp}
        </span>
        {mission.claimed ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
            <Check className="h-4 w-4" aria-hidden="true" />
            {claimedLabel}
          </span>
        ) : (
          <button
            type="button"
            onClick={onClaim}
            disabled={claiming}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-70"
          >
            {claiming && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {claimLabel}
          </button>
        )}
      </div>
      {/* Reroll row — solo aparece en misiones rotativas no completadas */}
      {onReroll && !mission.claimed && (
        <div className="mt-2 flex items-center justify-end gap-1.5">
          <span className="text-[11px] text-muted-foreground">🪵 {rerollCost}</span>
          <button
            type="button"
            onClick={onReroll}
            disabled={!canReroll || rerolling}
            aria-label={rerollLabel}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {rerolling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {rerollLabel}
          </button>
        </div>
      )}
    </div>
  );
}
