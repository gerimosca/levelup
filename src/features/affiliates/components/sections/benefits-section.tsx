'use client';

import { DollarSign, RefreshCw, BarChart3, Users, Zap, Shield } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SectionWrapper } from '@/shared/components/layout';
import { FadeIn } from '@/shared/components/motion/fade-in';
import type { BenefitsContent } from '../../types/sections';

interface BenefitsSectionProps {
  content: BenefitsContent;
  locale: string;
  variant?: 'A' | 'B';
}

export function BenefitsSection({
  content,
  locale,
  variant = 'A'
}: BenefitsSectionProps) {
  const t = (key: Record<string, string>) => key[locale] || key['en'];

  // Map icon names to components
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      DollarSign,
      RefreshCw,
      BarChart3,
      Users,
      Zap,
      Shield
    };
    return icons[iconName] || DollarSign;
  };

  return (
    <SectionWrapper sectionKey="affiliate-benefits" variant={variant} className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12" data-editable-section="benefits">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.benefits.map((benefit, index) => {
            const Icon = getIcon(benefit.icon);
            return (
              <FadeIn key={index} delay={0.2 + index * 0.1}>
                <Card
                  className={`h-full hover:shadow-lg transition-all duration-300 ${
                    benefit.highlight
                      ? 'border-primary shadow-md'
                      : 'border-border'
                  }`}
                  data-editable-field={`benefit-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        benefit.highlight
                          ? 'bg-primary/10'
                          : 'bg-muted'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          benefit.highlight
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">
                          {t(benefit.title)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(benefit.description)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}