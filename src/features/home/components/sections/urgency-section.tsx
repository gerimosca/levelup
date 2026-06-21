'use client';

import { useState, useEffect } from 'react';
import { SectionWrapper } from '@/shared/components/layout';
import type { UrgencyContent } from '../../types/sections';
import * as Icons from 'lucide-react';
import { FadeIn } from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

interface UrgencySectionProps {
  content: UrgencyContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * Urgency Section Component
 * Creates FOMO with countdown, limited spots, discounts, etc.
 * Admin-ready with full content externalization
 */
export function UrgencySection({
  content,
  locale,
  variant = 'A'
}: UrgencySectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const message = getLocalizedText(content.content.message);
  const highlight = content.content.highlight ? getLocalizedText(content.content.highlight) : null;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // State for social activity rotation
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const activities = content.content.recentActivity;

  // Calculate time remaining
  useEffect(() => {
    if (content.type !== 'countdown' && content.type !== 'mixed') return;
    if (!content.content.endDate) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(content.content.endDate!).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [content.type, content.content.endDate]);

  // Rotate through activities
  useEffect(() => {
    if (!activities || activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activities]);

  // Don't render if not enabled
  if (!content.enabled) return null;

  // Render based on style
  const renderContent = () => {
    switch (content.style) {
      case 'banner':
        return renderBanner();
      case 'card':
        return renderCard();
      case 'floating':
        return renderFloating();
      default:
        return renderCard();
    }
  };

  const renderBanner = () => (
    <div className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          {/* Icon */}
          <Icons.Zap className="w-5 h-5 animate-pulse" />

          {/* Message */}
          <div className="flex-1 max-w-2xl">
            <span className="font-medium">{message}</span>
            {highlight && (
              <span className="ml-2 font-bold text-lg">{highlight}</span>
            )}
          </div>

          {/* Type-specific content */}
          {renderTypeContent()}
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className="container mx-auto px-4">
      <FadeIn>
        <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
          <div className="text-center space-y-4">
            {/* Message */}
            <h3 className="text-2xl md:text-3xl font-bold">
              {message}
            </h3>

            {highlight && (
              <p className="text-xl text-destructive font-semibold">
                {highlight}
              </p>
            )}

            {/* Type-specific content */}
            {renderTypeContent()}

            {/* Discount details if available */}
            {content.content.discountCode && (
              <div className="pt-4 border-t border-destructive/20">
                <p className="text-sm text-muted-foreground mb-2">
                  {locale === 'es' ? 'Usa el código:' : 'Use code:'}
                </p>
                <div className="inline-block px-4 py-2 bg-background rounded-lg border-2 border-dashed border-destructive">
                  <code className="text-lg font-mono font-bold text-destructive">
                    {content.content.discountCode}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );

  const renderFloating = () => (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <div className="p-4 rounded-lg bg-background border shadow-xl">
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={() => {/* Implement close */}}
        >
          <Icons.X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <p className="font-semibold text-sm">{message}</p>
          {highlight && (
            <p className="text-destructive font-bold">{highlight}</p>
          )}
          {renderTypeContent()}
        </div>
      </div>
    </div>
  );

  const renderTypeContent = () => {
    switch (content.type) {
      case 'countdown':
        return renderCountdown();
      case 'limited-spots':
        return renderLimitedSpots();
      case 'discount':
        return renderDiscount();
      case 'social-activity':
        return renderSocialActivity();
      case 'mixed':
        return renderMixed();
      default:
        return null;
    }
  };

  const renderCountdown = () => {
    if (!timeLeft) return null;

    return (
      <div className="flex justify-center gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center">
            <div className="px-3 py-2 bg-background rounded-lg border">
              <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground capitalize">{unit}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLimitedSpots = () => {
    const spots = content.content.spotsLeft;
    if (!spots) return null;

    return (
      <div className="flex items-center justify-center gap-2">
        <Icons.Users className="w-5 h-5 text-destructive" />
        <span className="font-bold text-lg">
          {locale === 'es'
            ? `Solo ${spots} lugares disponibles`
            : `Only ${spots} spots left`}
        </span>
      </div>
    );
  };

  const renderDiscount = () => {
    const { discountPercentage, originalPrice, discountedPrice } = content.content;

    return (
      <div className="flex items-center justify-center gap-4">
        {originalPrice && discountedPrice && (
          <>
            <span className="text-2xl line-through text-muted-foreground">
              {originalPrice}
            </span>
            <Icons.ArrowRight className="w-5 h-5" />
            <span className="text-3xl font-bold text-destructive">
              {discountedPrice}
            </span>
          </>
        )}
        {discountPercentage && (
          <span className="px-3 py-1 bg-destructive text-destructive-foreground rounded-full text-sm font-bold">
            -{discountPercentage}%
          </span>
        )}
      </div>
    );
  };

  const renderSocialActivity = () => {
    if (!activities || activities.length === 0) return null;

    const activity = activities[currentActivityIndex];

    return (
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>
          <strong>{activity.user}</strong> {getLocalizedText(activity.action)}{' '}
          <span className="text-muted-foreground">{getLocalizedText(activity.timeAgo)}</span>
        </span>
      </div>
    );
  };

  const renderMixed = () => (
    <div className="space-y-4">
      {content.content.endDate && renderCountdown()}
      {content.content.spotsLeft && renderLimitedSpots()}
      {(content.content.discountPercentage || content.content.originalPrice) && renderDiscount()}
    </div>
  );

  // Determine wrapper based on position
  if (content.position === 'floating') {
    return renderFloating();
  }

  return (
    <SectionWrapper
      sectionKey="urgency"
      variant={variant}
      className={cn(
        content.style === 'banner' ? 'py-0' : 'py-12',
        content.position === 'top' && 'order-first'
      )}
    >
      {renderContent()}
    </SectionWrapper>
  );
}