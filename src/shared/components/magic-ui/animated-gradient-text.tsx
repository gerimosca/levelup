'use client';

import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}

/**
 * Animated gradient text with smooth color transition
 * Reusable for headlines, CTAs, and emphasis text
 */
export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        'inline-flex animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent',
        className
      )}
      style={{ '--bg-size': '300%' } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

export default AnimatedGradientText;
