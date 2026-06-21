'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { SectionWrapper } from '@/shared/components/layout';
import type { HeroContent } from '../../types/sections';
import * as Icons from 'lucide-react';
import {
  AnimatedShinyText,
  BorderBeam,
  AnimatedGradientText,
  DotPattern,
  FadeIn,
} from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

interface HeroSectionProps {
  content: HeroContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * Hero Section Component
 * Admin-ready with Magic UI effects preserved
 * All text content externalized for future admin editing
 */
export function HeroSection({
  content,
  locale,
  variant = 'A'
}: HeroSectionProps) {
  // Get localized content with fallback to English
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  // Extract all localized content
  const badgeText = content.badge ? getLocalizedText(content.badge.text) : null;
  const headline = getLocalizedText(content.headline);
  const headlineHighlight = content.headlineHighlight ? getLocalizedText(content.headlineHighlight) : null;
  const subheadline = getLocalizedText(content.subheadline);
  const primaryText = getLocalizedText(content.ctaPrimary.text);
  const secondaryText = content.ctaSecondary ? getLocalizedText(content.ctaSecondary.text) : null;
  const socialProofText = content.socialProofText ? getLocalizedText(content.socialProofText) : null;

  // Get icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  // Render background effect based on type
  const renderBackgroundEffect = () => {
    switch (content.backgroundEffect) {
      case 'dots':
        return <DotPattern className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]" />;
      case 'grid':
        return <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />;
      case 'gradient':
        return <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />;
      default:
        return null;
    }
  };

  return (
    <SectionWrapper
      sectionKey="hero"
      variant={variant}
      as="section"
      className="relative flex flex-col items-center justify-center px-4 py-32 md:py-40 text-center overflow-hidden"
    >
      {/* Background Effect */}
      {renderBackgroundEffect()}

      {/* Badge */}
      {badgeText && (
        <FadeIn delay={0}>
          <div className="mb-8 flex justify-center" data-editable-field="badge">
            <div
              className={cn(
                'group rounded-full border border-black/5 bg-neutral-100/80 backdrop-blur-sm text-base transition-all ease-in hover:cursor-pointer hover:bg-neutral-200/80 dark:border-white/5 dark:bg-neutral-900/80 dark:hover:bg-neutral-800/80'
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1.5 text-sm transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                {getIcon(content.badge?.icon) || <Icons.Sparkles className="mr-2 size-3.5" />}
                <span className="ml-1">{badgeText}</span>
                <Icons.ArrowRight className="ml-2 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedShinyText>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Title */}
      <FadeIn delay={0.1}>
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
          data-editable-field="headline"
        >
          {headline}{' '}
          {headlineHighlight && (
            <>
              <AnimatedGradientText data-editable-field="headlineHighlight">
                {headlineHighlight}
              </AnimatedGradientText>
              <br />
            </>
          )}
        </h1>
      </FadeIn>

      {/* Subtitle */}
      <FadeIn delay={0.2}>
        <p
          className="mt-6 text-lg md:text-xl leading-8 text-muted-foreground max-w-2xl"
          data-editable-field="subheadline"
        >
          {subheadline}
        </p>
      </FadeIn>

      {/* CTA Buttons */}
      <FadeIn delay={0.3}>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="relative">
            <Button
              size="lg"
              className="px-8"
              variant={content.ctaPrimary.style || 'default'}
              asChild
              data-editable-field="ctaPrimary"
            >
              <Link href={content.ctaPrimary.href}>
                {primaryText}
                {getIcon(content.ctaPrimary.icon) || <Icons.ArrowRight className="ml-2 size-4" />}
              </Link>
            </Button>
            <BorderBeam size={60} duration={12} delay={0} />
          </div>

          {secondaryText && (
            <Button
              size="lg"
              variant={content.ctaSecondary?.style || 'outline'}
              className="px-8"
              asChild
              data-editable-field="ctaSecondary"
            >
              <Link href={content.ctaSecondary?.href || '#'}>
                {secondaryText}
              </Link>
            </Button>
          )}
        </div>
      </FadeIn>

      {/* Trust Badges */}
      {content.trustBadges && content.trustBadges.length > 0 && (
        <FadeIn delay={0.4}>
          <div
            className="mt-12 flex flex-wrap justify-center gap-6"
            data-editable-field="trustBadges"
          >
            {content.trustBadges.map((badge, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                  badge.highlighted
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground"
                )}
              >
                {getIcon(badge.icon) || <Icons.Check className="w-4 h-4" />}
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Social Proof Text */}
      {socialProofText && (
        <FadeIn delay={0.5}>
          <p
            className="mt-8 text-sm text-muted-foreground animate-pulse"
            data-editable-field="socialProofText"
          >
            {socialProofText}
          </p>
        </FadeIn>
      )}
    </SectionWrapper>
  );
}