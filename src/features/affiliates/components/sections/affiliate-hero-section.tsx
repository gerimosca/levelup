'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { SectionWrapper } from '@/shared/components/layout';
import { FadeIn } from '@/shared/components/motion/fade-in';
import type { AffiliateHeroContent } from '../../types/sections';

interface AffiliateHeroSectionProps {
  content: AffiliateHeroContent;
  locale: string;
  variant?: 'A' | 'B';
  commissionRate?: string; // From admin settings
}

export function AffiliateHeroSection({
  content,
  locale,
  variant = 'A',
  commissionRate = '30%'
}: AffiliateHeroSectionProps) {
  const t = (key: Record<string, string>) => key[locale] || key['en'];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SectionWrapper sectionKey="affiliate-hero" variant={variant} className="relative overflow-hidden">
      {/* Background decoration - similar to home hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-32 relative">
        <div className="text-center space-y-6" data-editable-section="affiliate-hero">

          {/* Headline */}
          <FadeIn delay={0.1}>
            <h1
              className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
              data-editable-field="headline"
            >
              {t(content.headline)}
            </h1>
          </FadeIn>

          {/* Subheadline */}
          <FadeIn delay={0.2}>
            <p
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
              data-editable-field="subheadline"
            >
              {t(content.subheadline).replace('{rate}', commissionRate)}
            </p>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.3}>
            <div className="flex justify-center mt-8">
              <Button
                size="lg"
                className="group"
                onClick={() => scrollToSection(content.ctaPrimary.href)}
                data-editable-field="cta-primary"
              >
                {t(content.ctaPrimary.text)}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </FadeIn>

          {/* Subtext */}
          {content.subtext && (
            <FadeIn delay={0.4}>
              <p className="text-sm text-muted-foreground mt-4" data-editable-field="subtext">
                {t(content.subtext)}
              </p>
            </FadeIn>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}