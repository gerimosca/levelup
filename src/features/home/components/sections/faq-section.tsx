'use client';

import { useState } from 'react';
import { SectionWrapper } from '@/shared/components/layout';
import type { FAQContent } from '../../types/sections';
import * as Icons from 'lucide-react';
import { FadeIn } from '@/shared/components/magic-ui';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface FAQSectionProps {
  content: FAQContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * FAQ Section Component
 * Displays frequently asked questions in accordion or grid layout
 * Admin-ready with full content externalization
 */
export function FAQSection({
  content,
  locale,
  variant = 'A'
}: FAQSectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;

  // State for accordion
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Render based on layout
  const renderFAQs = () => {
    switch (content.layout) {
      case 'accordion':
        return renderAccordion();
      case 'grid':
        return renderGrid();
      case 'two-column':
        return renderTwoColumn();
      default:
        return renderAccordion();
    }
  };

  const renderAccordion = () => (
    <div className="max-w-3xl mx-auto space-y-4">
      {content.items.map((item, index) => {
        const isOpen = openItems.includes(item.id);
        const question = getLocalizedText(item.question);
        const answer = getLocalizedText(item.answer);

        return (
          <FadeIn key={item.id} delay={0.05 * (index + 1)}>
            <div
              className="rounded-lg border bg-card overflow-hidden"
              data-editable-field={`items.${index}`}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <span className="font-medium pr-4">{question}</span>
                <Icons.ChevronDown
                  className={cn(
                    "w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "px-6 overflow-hidden transition-all duration-200",
                  isOpen ? "py-4 pb-6" : "max-h-0"
                )}
              >
                <p className="text-muted-foreground">{answer}</p>
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );

  const renderGrid = () => (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {content.items.map((item, index) => {
        const question = getLocalizedText(item.question);
        const answer = getLocalizedText(item.answer);

        return (
          <FadeIn key={item.id} delay={0.05 * (index + 1)}>
            <div
              className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow"
              data-editable-field={`items.${index}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Icons.HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{question}</h3>
                  <p className="text-sm text-muted-foreground">{answer}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );

  const renderTwoColumn = () => {
    const halfPoint = Math.ceil(content.items.length / 2);
    const leftColumn = content.items.slice(0, halfPoint);
    const rightColumn = content.items.slice(halfPoint);

    return (
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Column */}
        <div className="space-y-6">
          {leftColumn.map((item, index) => {
            const question = getLocalizedText(item.question);
            const answer = getLocalizedText(item.answer);

            return (
              <FadeIn key={item.id} delay={0.05 * (index + 1)}>
                <div data-editable-field={`items.${index}`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icons.MessageSquare className="w-4 h-4 text-primary" />
                    {question}
                  </h3>
                  <p className="text-muted-foreground pl-6">{answer}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {rightColumn.map((item, index) => {
            const actualIndex = index + halfPoint;
            const question = getLocalizedText(item.question);
            const answer = getLocalizedText(item.answer);

            return (
              <FadeIn key={item.id} delay={0.05 * (actualIndex + 1)}>
                <div data-editable-field={`items.${actualIndex}`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icons.MessageSquare className="w-4 h-4 text-primary" />
                    {question}
                  </h3>
                  <p className="text-muted-foreground pl-6">{answer}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <SectionWrapper
      sectionKey="faq"
      variant={variant}
      className="py-16 md:py-24 bg-muted/30"
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

        {/* FAQs */}
        {renderFAQs()}

        {/* Contact CTA */}
        {content.showContactCTA && (
          <FadeIn delay={0.5}>
            <div className="text-center mt-12 p-8 rounded-lg bg-background border">
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'es'
                  ? '¿Tienes más preguntas?'
                  : 'Have more questions?'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {locale === 'es'
                  ? 'Estamos aquí para ayudarte. Contáctanos y te responderemos rápidamente.'
                  : 'We\'re here to help. Contact us and we\'ll get back to you quickly.'}
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:support@example.com">
                  <Icons.Mail className="w-4 h-4 mr-2" />
                  {locale === 'es' ? 'Contactar Soporte' : 'Contact Support'}
                </a>
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </SectionWrapper>
  );
}