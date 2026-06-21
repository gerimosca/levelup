'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { SectionWrapper } from '@/shared/components/layout';
import { FadeIn } from '@/shared/components/motion/fade-in';
import type { FAQContent } from '../../types/sections';

interface FAQSectionProps {
  content: FAQContent;
  locale: string;
  variant?: 'A' | 'B';
  commissionRate?: string; // To replace {rate} in answers
}

export function FAQSection({
  content,
  locale,
  variant = 'A',
  commissionRate = '30%'
}: FAQSectionProps) {
  const t = (key: Record<string, string>) => key[locale] || key['en'];

  return (
    <SectionWrapper sectionKey="affiliate-faq" variant={variant} className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12" data-editable-section="faq">
          <FadeIn delay={0}>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-editable-field="headline"
            >
              {t(content.headline)}
            </h2>
          </FadeIn>
        </div>

        <div className="space-y-4">
          {content.questions.map((item, index) => (
            <FadeIn key={item.id} delay={0.1 + index * 0.05}>
              <Card
                className="hover:shadow-md transition-shadow duration-300"
                data-editable-field={`faq-${item.id}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t(item.question)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t(item.answer).replace('{rate}', commissionRate)}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}