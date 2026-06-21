/** Barra de un atributo con su rango y qué hábito lo sube (pantalla "Yo"). */
export function AttributeBar({
  name,
  rankLabel,
  progress,
  color,
  hint,
}: {
  name: string;
  rankLabel: string;
  progress: number;
  color: string;
  hint?: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">{rankLabel}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
