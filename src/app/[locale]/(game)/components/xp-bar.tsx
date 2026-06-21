/**
 * XpBar — barra de experiencia. Componente de presentación puro.
 * El cálculo (nivel, progreso) viene de @/game-core; aquí solo se pinta.
 * En fases posteriores se animará el llenado (ver docs/design/03-ux-ui.md §5).
 */
export function XpBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
      className="h-3 w-full overflow-hidden rounded-full bg-secondary"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
