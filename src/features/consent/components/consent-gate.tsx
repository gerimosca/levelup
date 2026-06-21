'use client';

import { useConsent } from '../hooks/use-consent';
import type { ConsentCategory } from '../types';

interface ConsentGateProps {
  /** The consent category required to render children */
  category: ConsentCategory;
  /** Content to render if consent is granted */
  children: React.ReactNode;
  /** Optional fallback to render if consent is denied */
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on consent status
 *
 * Use this to wrap components that should only load when
 * the user has given consent for a specific category.
 *
 * @example
 * ```tsx
 * // Only load Meta Pixel if marketing consent is granted
 * <ConsentGate category="marketing">
 *   <MetaPixelScript />
 * </ConsentGate>
 *
 * // With fallback
 * <ConsentGate
 *   category="marketing"
 *   fallback={<p>Enable marketing cookies to see personalized content</p>}
 * >
 *   <PersonalizedRecommendations />
 * </ConsentGate>
 * ```
 */
export function ConsentGate({
  category,
  children,
  fallback = null,
}: ConsentGateProps) {
  const { consent } = useConsent();

  // Necessary is always granted
  if (category === 'necessary') {
    return <>{children}</>;
  }

  // Check if category is consented
  if (consent[category]) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
