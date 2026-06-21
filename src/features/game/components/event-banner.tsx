import { Sparkles } from 'lucide-react';

/** Banner del evento del día (solo si aporta bonus). */
export function EventBanner({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-3">
      <Sparkles className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-accent">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
