'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Share2, Check } from 'lucide-react';
import { brand } from '@/shared/config';

interface ShareProgressProps {
  streak: number;
  level: number;
  tierLabel: string;
  achievedCount: number;
  totalCount: number;
}

export function ShareProgress({
  streak,
  level,
  tierLabel,
  achievedCount,
  totalCount,
}: ShareProgressProps) {
  const tm = useTranslations('me');
  const [shared, setShared] = useState(false);

  const text = [
    `🔥 ${tm('share.streak', { days: streak })}`,
    `⚡ ${tm('share.level', { level, tier: tierLabel })}`,
    `🏅 ${tm('share.achievements', { done: achievedCount, total: totalCount })}`,
    '',
    tm('share.tagline'),
  ].join('\n');

  const url = brand.website;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success(tm('share.copied'));
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* user cancelled or permission denied — silent */
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold transition-colors active:bg-secondary"
    >
      {shared ? (
        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden="true" />
      )}
      {tm('share.button')}
    </button>
  );
}
