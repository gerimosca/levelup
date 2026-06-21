'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Tent, Map, PawPrint, BookOpen, User, Swords, type LucideIcon } from 'lucide-react';

/** Las 6 secciones de LevelUp (Campamento es la Home). */
const TABS: { key: string; icon: LucideIcon }[] = [
  { key: 'home', icon: Tent },
  { key: 'map', icon: Map },
  { key: 'pet', icon: PawPrint },
  { key: 'challenge', icon: Swords },
  { key: 'encyclopedia', icon: BookOpen },
  { key: 'me', icon: User },
];

/**
 * Barra de navegación inferior, pulgar-friendly. Es el único sistema de
 * navegación de la app (sin sidebar). Textos desde copies (namespace `game`).
 */
export function BottomNav() {
  const t = useTranslations('game');
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t('nav.home')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
    >
      <ul
        className="mx-auto flex w-full max-w-md items-stretch justify-around px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map(({ key, icon: Icon }) => {
          const href = `/${locale}/${key}`;
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span>{t(`nav.${key}`)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
