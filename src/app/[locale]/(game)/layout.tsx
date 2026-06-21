import { requireUser } from '@/shared/auth';
import { AppProvider } from '@/shared/providers';
import { MotionProvider, PwaInstallBanner, PwaRegister, OfflineBanner } from '@/features/game';
import { BottomNav } from './components/bottom-nav';

/**
 * Layout del grupo (game) — el shell de la app LevelUp.
 *
 * - Protege todas las rutas hijas con requireUser (además del middleware).
 * - Aplica el tema RPG oscuro SCOPEADO (data-theme="rpg" + .dark) para no
 *   afectar a la web de marketing/landing (ver docs/design/03-ux-ui.md §2).
 * - Navegación: bottom nav de 5 tabs (sin sidebar).
 */
export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireUser(locale);

  return (
    <AppProvider
      initialState={{
        user: { id: user.id, email: user.email, avatar_url: user.avatar },
        subscription: null,
        credits: 0,
      }}
    >
      <div
        data-theme="rpg"
        className="relative min-h-dvh bg-background text-foreground"
      >
        <main
          id="main-content"
          className="mx-auto w-full max-w-md px-4 pb-28 pt-6"
        >
          <MotionProvider>{children}</MotionProvider>
        </main>
        <PwaRegister />
        <OfflineBanner />
        <PwaInstallBanner />
        <BottomNav />
      </div>
    </AppProvider>
  );
}
