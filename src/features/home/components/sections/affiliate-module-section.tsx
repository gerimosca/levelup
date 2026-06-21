'use client';

import { DollarSign, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { SectionWrapper } from '@/shared/components/layout';
import type { AffiliateModuleContent } from '../../types/sections';

interface AffiliateModuleSectionProps {
  content: AffiliateModuleContent;
  locale: string;
  variant?: 'A' | 'B';
}

export function AffiliateModuleSection({
  content,
  locale,
  variant = 'A'
}: AffiliateModuleSectionProps) {
  const t = (key: Record<string, string>) => key[locale] || key['en'];

  return (
    <SectionWrapper sectionKey="affiliate-module" className="py-20">
      <div className="container mx-auto max-w-7xl px-4" data-editable-section="affiliate-module">
        {/* Badge */}
        {content.badge && (
          <div className="flex justify-center mb-4">
            <Badge
              variant={content.badge.variant as any || 'default'}
              className="text-sm px-3 py-1"
              data-editable-field="badge"
            >
              {t(content.badge.text)}
            </Badge>
          </div>
        )}

        {/* Headline */}
        <h2
          className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          data-editable-field="headline"
        >
          {t(content.headline)}
        </h2>

        {/* Subheadline */}
        <p
          className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto"
          data-editable-field="subheadline"
        >
          {t(content.subheadline)}
        </p>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {content.features.map((feature, index) => {
            const Icon = feature.icon === 'DollarSign' ? DollarSign :
                        feature.icon === 'TrendingUp' ? TrendingUp :
                        feature.icon === 'Users' ? Users : DollarSign;

            return (
              <Card
                key={index}
                className="border-primary/20 hover:border-primary/40 transition-colors"
                data-editable-field={`feature-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {t(feature.title)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(feature.description)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section (optional) */}
        {content.stats && (
          <div className="grid md:grid-cols-3 gap-4 mb-12 p-6 bg-muted/30 rounded-xl">
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center" data-editable-field={`stat-${index}`}>
                <div className="text-3xl font-bold text-primary mb-1">
                  {t(stat.value)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(stat.label)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="group"
            data-editable-field="cta"
            asChild
          >
            <a href={content.cta.href}>
              {t(content.cta.text)}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          {content.ctaSubtext && (
            <p
              className="text-sm text-muted-foreground mt-3"
              data-editable-field="ctaSubtext"
            >
              {t(content.ctaSubtext)}
            </p>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}