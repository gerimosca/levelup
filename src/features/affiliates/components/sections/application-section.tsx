'use client';

import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SectionWrapper } from '@/shared/components/layout';
import { FadeIn } from '@/shared/components/motion/fade-in';
import type { ApplicationContent } from '../../types/sections';

interface ApplicationSectionProps {
  content: ApplicationContent;
  locale: string;
  variant?: 'A' | 'B';
  rewardfulFormUrl?: string; // From admin settings
  id?: string; // Section ID for anchor navigation
}

export function ApplicationSection({
  content,
  locale,
  variant = 'A',
  rewardfulFormUrl,
  id
}: ApplicationSectionProps) {
  const t = (key: Record<string, string>) => key[locale] || key['en'];

  return (
    <SectionWrapper
      sectionKey="affiliate-application"
      variant={variant}
      className="py-20 bg-primary text-primary-foreground"
      id={id}
    >
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-10" data-editable-section="application">
          <FadeIn delay={0}>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-editable-field="headline"
            >
              {t(content.headline)}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p
              className="text-xl opacity-90"
              data-editable-field="subheadline"
            >
              {t(content.subheadline)}
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.2}>
          {rewardfulFormUrl ? (
            <Card className="bg-background text-foreground">
              <CardContent className="p-0">
                <iframe
                  src={rewardfulFormUrl}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  scrolling="yes"
                  className="rounded-lg"
                  title="Affiliate Application Form"
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-background text-foreground">
              <CardContent className="p-8">
                <p className="text-center text-muted-foreground text-lg">
                  {t(content.notConfiguredMessage)}
                </p>
              </CardContent>
            </Card>
          )}
        </FadeIn>

        {/* Features list */}
        {content.features && content.features.length > 0 && (
          <FadeIn delay={0.3}>
            <div className="mt-8 space-y-3 max-w-xl mx-auto">
              {content.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-primary-foreground/90"
                  data-editable-field={`feature-${index}`}
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{t(feature.text)}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </SectionWrapper>
  );
}