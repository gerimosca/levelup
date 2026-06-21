'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './button';

/**
 * ThemeToggle - Button to toggle between light/dark/system themes
 *
 * Usage:
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

/**
 * ThemeSelect - Dropdown to select theme (light/dark/system)
 *
 * Usage:
 * ```tsx
 * <ThemeSelect />
 * ```
 */
export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render with default variant until mounted
  const getVariant = (value: string) => {
    if (!mounted) return 'outline';
    return theme === value ? 'default' : 'outline';
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={getVariant('light')}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-8"
      >
        <Sun className="mr-2 h-4 w-4" />
        Light
      </Button>
      <Button
        variant={getVariant('dark')}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-8"
      >
        <Moon className="mr-2 h-4 w-4" />
        Dark
      </Button>
      <Button
        variant={getVariant('system')}
        size="sm"
        onClick={() => setTheme('system')}
        className="h-8"
      >
        <Monitor className="mr-2 h-4 w-4" />
        System
      </Button>
    </div>
  );
}
