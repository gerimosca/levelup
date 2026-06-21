'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, X, LayoutDashboard, User, LogOut } from 'lucide-react';
import { Button } from './button';
import { brand } from '@/shared/config';
import { logoutAction } from '@/features/auth/auth.actions';

// Helper to get glass classes based on config
const glassClasses = brand.theme.glass
  ? 'glass border-white/10'
  : 'bg-background border-border';

/**
 * MobileMenu - Hamburger menu for mobile app navigation
 *
 * Usage:
 * ```tsx
 * <MobileMenu />
 * ```
 */
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('layouts');
  const locale = useLocale();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <div className={`absolute left-0 right-0 top-14 z-50 border-b p-4 shadow-lg ${glassClasses}`}>
          <nav className="flex flex-col space-y-2">
            <Link
              href={`/${locale}/dashboard`}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-accent"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t('dashboard')}</span>
            </Link>
            <Link
              href={`/${locale}/my-account`}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-accent"
            >
              <User className="h-4 w-4" />
              <span>{t('myAccount')}</span>
            </Link>
            <div className="border-t pt-2">
              <form action={logoutAction}>
                <input type="hidden" name="locale" value={locale} />
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  type="submit"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </Button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
