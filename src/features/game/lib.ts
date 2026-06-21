/** Helpers de fecha sobre strings YYYY-MM-DD (sin dependencias). */

/** Día de la semana en UTC (0 = domingo, 6 = sábado). */
export function dayOfWeekISO(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

export function isWeekendISO(dateStr: string): boolean {
  const dow = dayOfWeekISO(dateStr);
  return dow === 0 || dow === 6;
}

/** Días enteros entre dos fechas (to - from). */
export function daysBetweenISO(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Devuelve la fecha desplazada `delta` días (YYYY-MM-DD). */
export function addDaysISO(dateStr: string, delta: number): string {
  const d = new Date(Date.parse(`${dateStr}T00:00:00Z`) + delta * 86_400_000);
  return d.toISOString().slice(0, 10);
}
