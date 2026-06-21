'use client';

import { SectionWrapper } from '@/shared/components/layout';
import type { HowItWorksContent } from '../../types/sections';
import * as Icons from 'lucide-react';
import { FadeIn } from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

interface HowItWorksSectionProps {
  content: HowItWorksContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * How It Works Section Component
 * Shows the simple steps to get started
 * Admin-ready with full content externalization
 */
export function HowItWorksSection({
  content,
  locale,
  variant = 'A'
}: HowItWorksSectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;

  // Get icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };

  // Render based on layout
  const renderSteps = () => {
    switch (content.layout) {
      case 'timeline':
        return renderTimelineLayout();
      case 'cards':
        return renderCardsLayout();
      case 'numbered':
        return renderNumberedLayout();
      case 'visual':
        return renderVisualLayout();
      default:
        return renderTimelineLayout();
    }
  };

  const renderTimelineLayout = () => (
    <div className="relative max-w-4xl mx-auto">
      {/* Vertical line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent md:-translate-x-1/2" />

      <div className="space-y-12">
        {content.steps.map((step, index) => (
          <FadeIn key={step.id} delay={0.1 * (index + 1)}>
            <div
              className={cn(
                "relative flex items-start gap-6",
                "md:gap-12",
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}
              data-editable-field={`steps.${index}`}
            >
              {/* Step number/icon */}
              <div className="flex-shrink-0 z-10">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number || `0${index + 1}`}
                </div>
              </div>

              {/* Content */}
              <div className={cn(
                "flex-1 p-6 rounded-lg bg-card border",
                index % 2 === 0 ? "md:text-right" : "md:text-left"
              )}>
                <div className="flex items-center gap-3 mb-2">
                  {index % 2 !== 0 && getIcon(step.icon)}
                  <h3 className="text-xl font-semibold">
                    {getLocalizedText(step.title)}
                  </h3>
                  {index % 2 === 0 && getIcon(step.icon)}
                </div>
                <p className="text-muted-foreground">
                  {getLocalizedText(step.description)}
                </p>
              </div>

              {/* Spacer for alternating layout */}
              <div className="hidden md:block flex-1" />
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );

  const renderCardsLayout = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {content.steps.map((step, index) => (
        <FadeIn key={step.id} delay={0.1 * (index + 1)}>
          <div
            className="relative p-6 rounded-lg bg-card border hover:shadow-lg transition-all"
            data-editable-field={`steps.${index}`}
          >
            {/* Step number */}
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>

            {/* Icon */}
            <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary inline-block">
              {getIcon(step.icon)}
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold mb-2">
              {getLocalizedText(step.title)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getLocalizedText(step.description)}
            </p>

            {/* Arrow to next step */}
            {index < content.steps.length - 1 && (
              <Icons.ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </FadeIn>
      ))}
    </div>
  );

  const renderNumberedLayout = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      {content.steps.map((step, index) => (
        <FadeIn key={step.id} delay={0.1 * (index + 1)}>
          <div
            className="flex gap-6 items-start"
            data-editable-field={`steps.${index}`}
          >
            {/* Large number */}
            <div className="text-6xl font-bold text-primary/20 leading-none">
              {step.number || `0${index + 1}`}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getIcon(step.icon)}
                <h3 className="text-xl font-semibold">
                  {getLocalizedText(step.title)}
                </h3>
              </div>
              <p className="text-muted-foreground">
                {getLocalizedText(step.description)}
              </p>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );

  const renderVisualLayout = () => (
    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {/* Steps list on the left */}
      <div className="space-y-6">
        {content.steps.map((step, index) => (
          <FadeIn key={step.id} delay={0.1 * (index + 1)}>
            <div
              className="flex gap-4 items-start p-4 rounded-lg hover:bg-muted/50 transition-colors"
              data-editable-field={`steps.${index}`}
            >
              {/* Step indicator */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  {getLocalizedText(step.title)}
                  {getIcon(step.icon)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getLocalizedText(step.description)}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Visual representation on the right */}
      <FadeIn delay={0.3}>
        <div className="relative h-full min-h-[400px] rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <Icons.Rocket className="w-16 h-16 mx-auto text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">
              {locale === 'es' ? 'Listo para lanzar' : 'Ready to Launch'}
            </p>
            <p className="text-muted-foreground mt-2">
              {locale === 'es' ? 'En minutos, no meses' : 'In minutes, not months'}
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );

  return (
    <SectionWrapper
      sectionKey="how-it-works"
      variant={variant}
      className="py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <FadeIn delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2
              data-editable-field="headline"
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              {headline}
            </h2>

            {subheadline && (
              <p
                data-editable-field="subheadline"
                className="text-lg text-muted-foreground"
              >
                {subheadline}
              </p>
            )}
          </div>
        </FadeIn>

        {/* Steps */}
        {renderSteps()}
      </div>
    </SectionWrapper>
  );
}