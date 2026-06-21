'use client';

import { Check, Loader2 } from 'lucide-react';
import type { MissionView } from '../types';

/** Tarjeta de misión con botón de reclamar. La principal va destacada. */
export function MissionCard({
  mission,
  label,
  claimLabel,
  claimedLabel,
  mainBadge,
  claiming,
  onClaim,
}: {
  mission: MissionView;
  label: string;
  claimLabel: string;
  claimedLabel: string;
  mainBadge?: string;
  claiming: boolean;
  onClaim: () => void;
}) {
  const isMain = mission.kind === 'main';
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${
        isMain ? 'border-primary/40 bg-primary/10' : 'border-border bg-card'
      } ${mission.claimed ? 'opacity-60' : ''}`}
    >
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
  );
}
