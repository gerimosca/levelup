import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getUser } from '@/shared/auth';

/**
 * Página raíz de LevelUp: NO hay landing de marketing.
 * - Sin sesión → directo al login.
 * - Con sesión → directo a la Home del juego.
 */
export default async function RootPage() {
  const locale = await getLocale();
  const user = await getUser();
  redirect(user ? `/${locale}/home` : `/${locale}/login`);
}
