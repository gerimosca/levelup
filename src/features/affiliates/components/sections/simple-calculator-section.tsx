'use client';

import { SectionWrapper } from '@/shared/components/layout';
import { FadeIn } from '@/shared/components/motion/fade-in';
import { SimpleCalculator } from '../calculator/simple-calculator';
import type { SimpleCalculatorContent } from '../../types/sections';

interface SimpleCalculatorSectionProps {
  content: SimpleCalculatorContent;
  locale: string;
  variant?: 'A' | 'B';
  // These come from admin settings
  commissionRate?: number;
  averageSalePrice?: number;
}

export function SimpleCalculatorSection({
  content,
  locale,
  variant = 'A',
  commissionRate,
  averageSalePrice
}: SimpleCalculatorSectionProps) {
  const t = (key: Record<string, string>) => key[locale] || key['en'];

  // Use admin settings if available, otherwise fall back to content defaults
  const rate = commissionRate ?? content.commissionRate ?? 30;
  const price = averageSalePrice ?? content.averageSalePrice ?? 297;

  return (
    <SectionWrapper
      sectionKey="affiliate-calculator"
      variant={variant}
      className="py-16 md:py-24"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12" data-editable-section="calculator">
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

        <SimpleCalculator
          commissionRate={rate}
          averageSalePrice={price}
          defaultReferrals={content.defaultReferrals}
          inputLabel={t(content.inputLabel)}
          outputLabel={t(content.outputLabel)}
          helpText={t(content.helpText)}
          locale={locale}
        />
      </div>
    </SectionWrapper>
  );
}