'use client';

import { UserCheck, Share2, Wallet } from 'lucide-react';
import { SectionWrapper } from '@/shared/components/layout';
import { FadeIn } from '@/shared/components/motion/fade-in';
import type { HowItWorksContent } from '../../types/sections';

interface HowItWorksSectionProps {
  content: HowItWorksContent;
  locale: string;
  variant?: 'A' | 'B';
}

export function HowItWorksSection({
  content,
  locale,
  variant = 'A'
}: HowItWorksSectionProps) {
  const t = (key: Record<string, string>) => key[locale] || key['en'];

  // Map icon names to components
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'UserCheck':
        return UserCheck;
      case 'Share2':
        return Share2;
      case 'Wallet':
        return Wallet;
      default:
        return UserCheck;
    }
  };

  return (
    <SectionWrapper sectionKey="affiliate-how-it-works" variant={variant} className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12" data-editable-section="how-it-works">
          <FadeIn delay={0}>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-editable-field="headline"
            >
              {t(content.headline)}
            </h2>
          </FadeIn>
          {content.subheadline && (
            <FadeIn delay={0.1}>
              <p
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                data-editable-field="subheadline"
              >
                {t(content.subheadline)}
              </p>
            </FadeIn>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {content.steps.map((step, index) => {
            const Icon = getIcon(step.icon);
            return (
              <FadeIn key={index} delay={0.2 + index * 0.1}>
                <div
                  className="relative text-center"
                  data-editable-field={`step-${index}`}
                >
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary rounded-full text-2xl font-bold text-primary mb-6 bg-background">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">
                    {t(step.title)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(step.description)}
                  </p>

                  {/* Connector line (except for last item) */}
                  {index < content.steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-full">
                      <div className="border-t-2 border-dashed border-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}