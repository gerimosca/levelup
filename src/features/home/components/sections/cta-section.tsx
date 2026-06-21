'use client';

import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { SectionWrapper } from '@/shared/components/layout';
import type { CTAContent } from '../../types/sections';
import * as Icons from 'lucide-react';
import { FadeIn, BorderBeam } from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

interface CTASectionProps {
  content: CTAContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * CTA Section Component
 * Final call-to-action to close the deal
 * Admin-ready with full content externalization
 */
export function CTASection({
  content,
  locale,
  variant = 'A'
}: CTASectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;
  const primaryText = getLocalizedText(content.ctaPrimary.text);
  const secondaryText = content.ctaSecondary ? getLocalizedText(content.ctaSecondary.text) : null;

  // Render based on style
  const renderContent = () => {
    switch (content.style) {
      case 'centered':
        return renderCentered();
      case 'split':
        return renderSplit();
      case 'minimal':
        return renderMinimal();
      case 'gradient':
        return renderGradient();
      default:
        return renderGradient();
    }
  };

  const renderCentered = () => (
    <div className="text-center max-w-3xl mx-auto">
      <FadeIn delay={0}>
        <h2
          data-editable-field="headline"
          className="text-3xl md:text-5xl font-bold mb-6"
        >
          {headline}
        </h2>
      </FadeIn>

      {subheadline && (
        <FadeIn delay={0.1}>
          <p
            data-editable-field="subheadline"
            className="text-xl text-muted-foreground mb-8"
          >
            {subheadline}
          </p>
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-lg px-8"
            asChild
            data-editable-field="ctaPrimary"
          >
            <Link href={content.ctaPrimary.href}>
              {primaryText}
              <Icons.ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>

          {secondaryText && (
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
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
    </div>
  );

  const renderSplit = () => (
    <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
      <div>
        <FadeIn delay={0}>
          <h2
            data-editable-field="headline"
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {headline}
          </h2>
        </FadeIn>

        {subheadline && (
          <FadeIn delay={0.1}>
            <p
              data-editable-field="subheadline"
              className="text-lg text-muted-foreground mb-6"
            >
              {subheadline}
            </p>
          </FadeIn>
        )}

        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              asChild
              data-editable-field="ctaPrimary"
            >
              <Link href={content.ctaPrimary.href}>
                {primaryText}
              </Link>
            </Button>

            {secondaryText && (
              <Button
                size="lg"
                variant="outline"
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
      </div>

      <FadeIn delay={0.3}>
        <div className="relative h-64 md:h-96 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Icons.Rocket className="w-24 h-24 text-primary/50" />
        </div>
      </FadeIn>
    </div>
  );

  const renderMinimal = () => (
    <div className="text-center">
      <FadeIn>
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-8 rounded-2xl bg-muted/50">
          <h2
            data-editable-field="headline"
            className="text-2xl font-bold"
          >
            {headline}
          </h2>

          <Button
            size="lg"
            asChild
            data-editable-field="ctaPrimary"
          >
            <Link href={content.ctaPrimary.href}>
              {primaryText}
              <Icons.ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </FadeIn>
    </div>
  );

  const renderGradient = () => (
    <div className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />

      <div className="relative text-center max-w-4xl mx-auto py-12">
        <FadeIn delay={0}>
          <h2
            data-editable-field="headline"
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
          >
            {headline}
          </h2>
        </FadeIn>

        {subheadline && (
          <FadeIn delay={0.1}>
            <p
              data-editable-field="subheadline"
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              {subheadline}
            </p>
          </FadeIn>
        )}

        <FadeIn delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative">
              <Button
                size="lg"
                className="text-lg px-10 py-6"
                asChild
                data-editable-field="ctaPrimary"
              >
                <Link href={content.ctaPrimary.href}>
                  {primaryText}
                  <Icons.ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <BorderBeam size={80} duration={10} delay={0} />
            </div>

            {secondaryText && (
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6"
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

        {/* Trust indicators */}
        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icons.Shield className="w-4 h-4" />
              <span>{locale === 'es' ? 'Pago seguro' : 'Secure payment'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Clock className="w-4 h-4" />
              <span>{locale === 'es' ? 'Acceso instantáneo' : 'Instant access'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Users className="w-4 h-4" />
              <span>{locale === 'es' ? '500+ desarrolladores' : '500+ developers'}</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );

  return (
    <SectionWrapper
      sectionKey="cta"
      variant={variant}
      className={cn(
        "py-16 md:py-24",
        content.style === 'gradient' && "py-20 md:py-32"
      )}
    >
      <div className="container mx-auto px-4">
        {renderContent()}
      </div>
    </SectionWrapper>
  );
}