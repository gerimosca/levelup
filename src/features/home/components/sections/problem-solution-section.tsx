'use client';

import { SectionWrapper } from '@/shared/components/layout';
import type { ProblemSolutionContent } from '../../types/sections';
import * as Icons from 'lucide-react';
import { FadeIn } from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

interface ProblemSolutionSectionProps {
  content: ProblemSolutionContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * Problem/Solution Section Component
 * Shows a visual comparison between traditional approach vs using our solution
 * Admin-ready with full content externalization
 */
export function ProblemSolutionSection({
  content,
  locale,
  variant = 'A'
}: ProblemSolutionSectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;

  const problemTitle = getLocalizedText(content.problem.title);
  const problemTimeEstimate = content.problem.timeEstimate ? getLocalizedText(content.problem.timeEstimate) : null;

  const solutionTitle = getLocalizedText(content.solution.title);
  const solutionTimeEstimate = content.solution.timeEstimate ? getLocalizedText(content.solution.timeEstimate) : null;

  // Get icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <SectionWrapper
      sectionKey="problem-solution"
      variant={variant}
      className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30"
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

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Problem Side */}
          <FadeIn delay={0.1}>
            <div
              className="relative p-6 rounded-xl border-2 border-destructive/20 bg-destructive/5"
              data-editable-field="problem"
            >
              {/* Red overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent rounded-xl pointer-events-none" />

              <div className="relative">
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Icons.X className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    {problemTitle}
                  </h3>
                </div>

                {/* Points */}
                <ul className="space-y-3">
                  {content.problem.points.map((point, index) => (
                    <li
                      key={point.id}
                      className="flex items-start gap-3"
                      data-editable-field={`problem.points.${index}`}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {getIcon(point.icon) || <Icons.X className="w-5 h-5 text-destructive" />}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getLocalizedText(point.text)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Time Estimate */}
                {problemTimeEstimate && (
                  <div className="mt-6 pt-6 border-t border-destructive/20">
                    <div className="flex items-center gap-2 text-destructive">
                      <Icons.Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {problemTimeEstimate}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Solution Side */}
          <FadeIn delay={0.2}>
            <div
              className="relative p-6 rounded-xl border-2 border-primary/20 bg-primary/5"
              data-editable-field="solution"
            >
              {/* Green overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl pointer-events-none" />

              <div className="relative">
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icons.Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    {solutionTitle}
                  </h3>
                </div>

                {/* Points */}
                <ul className="space-y-3">
                  {content.solution.points.map((point, index) => (
                    <li
                      key={point.id}
                      className="flex items-start gap-3"
                      data-editable-field={`solution.points.${index}`}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {getIcon(point.icon) || <Icons.Check className="w-5 h-5 text-primary" />}
                      </span>
                      <span className="text-sm">
                        {getLocalizedText(point.text)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Time Estimate */}
                {solutionTimeEstimate && (
                  <div className="mt-6 pt-6 border-t border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <Icons.Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {solutionTimeEstimate}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Visual Connector for Desktop */}
        <div className="hidden md:flex justify-center -mt-12 relative z-10">
          <FadeIn delay={0.3}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent to-primary/50" />
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <Icons.ArrowRight className="w-5 h-5" />
              </div>
              <div className="w-20 h-0.5 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
          </FadeIn>
        </div>
      </div>
    </SectionWrapper>
  );
}