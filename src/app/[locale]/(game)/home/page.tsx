import { HomeClient } from '@/features/game';

/**
 * Home — centro de mando diario (ver docs/design/01-product.md §3).
 * El loop completo (misiones → reclamar → XP/nivel/enemigo) vive en
 * features/game. Esta página solo monta el cliente, que obtiene el estado del
 * día con la fecha LOCAL del usuario.
 */
export default function HomePage() {
  return <HomeClient />;
}
