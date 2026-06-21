'use client';

import { useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

interface SectionWrapperProps {
  sectionKey: string;
  variant?: 'A' | 'B';
  className?: string;
  children: React.ReactNode;
  as?: 'section' | 'div' | 'article';
  id?: string;
}

/**
 * Base wrapper for all home sections
 * Provides tracking capabilities and admin-ready data attributes
 * Future: Will handle impression tracking and A/B testing
 */
export function SectionWrapper({
  sectionKey,
  variant = 'A',
  className,
  children,
  as: Component = 'section',
  id
}: SectionWrapperProps) {
  // Future: Track impressions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // TODO: Implement when tracking is ready
      // trackImpression(sectionKey, variant);

      // For now, just log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Section Impression] ${sectionKey}-${variant}`);
      }
    }
  }, [sectionKey, variant]);

  return (
    <Component
      id={id}
      data-section={sectionKey}
      data-variant={variant}
      data-editable="true"
      data-admin-ready="true"
      className={cn('relative', className)}
    >
      {/* Future: Admin edit button overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 z-10 opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
            {sectionKey} ({variant})
          </div>
        </div>
      )}

      {children}
    </Component>
  );
}