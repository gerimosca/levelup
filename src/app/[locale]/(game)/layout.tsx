import { requireUser } from '@/shared/auth';
import { AppProvider } from '@/shared/providers';
import { MotionProvider, PwaRegister, OfflineBanner } from '@/features/game';
import { BottomNav } from './components/bottom-nav';

/**
 * Layout del grupo (game) — el shell de la app LevelUp.
 *
 * - Responsive: mobile (full-width) → tablet/desktop (columna centrada max-w-md).
 * - El fondo en desktop añade profundidad para que la columna se vea intencional.
 * - Navegación: bottom nav centrada, pulgar-friendly en móvil.
 * - Tema RPG oscuro scopeado (data-theme="rpg") para no afectar landing.
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
      {/* Fondo con gradiente sutil — refuerza la columna central en desktop */}
      <div
        data-theme="rpg"
        className="relative min-h-dvh bg-background text-foreground"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.04) 0%, transparent 50%)',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Columna central — full-width en mobile, max-w-md en tablet+ */}
        <main
          id="main-content"
          className="relative mx-auto w-full max-w-md px-4 pb-28 pt-6 sm:pt-8"
        >
          <MotionProvider>{children}</MotionProvider>
        </main>

        <PwaRegister />
        <OfflineBanner />
        <BottomNav />
      </div>
    </AppProvider>
  );
}
