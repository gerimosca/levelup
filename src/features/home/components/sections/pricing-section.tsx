'use client';

import Script from 'next/script';
import { SectionWrapper } from '@/shared/components/layout';
import type { PricingContent } from '../../types/sections';
import { Badge } from '@/shared/components/ui/badge';
import { FadeIn } from '@/shared/components/magic-ui';

interface PricingSectionProps {
  content: PricingContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * Pricing Section Component
 * Integrates Stripe Pricing Table
 * Admin-ready with full content externalization
 */
export function PricingSection({
  content,
  locale,
  variant = 'A'
}: PricingSectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;
  const customMessage = content.customMessage ? getLocalizedText(content.customMessage) : null;
  const badgeText = content.badge ? getLocalizedText(content.badge.text) : null;

  return (
    <>
      {/* Stripe Pricing Table Script */}
      <Script
        async
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="lazyOnload"
      />

      <SectionWrapper
        sectionKey="pricing"
        variant={variant}
        className="py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <FadeIn delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-12">
              {/* Badge */}
              {badgeText && (
                <div className="mb-4">
                  <Badge
                    variant={content.badge?.variant || 'secondary'}
                    className="text-sm px-3 py-1"
                    data-editable-field="badge"
                  >
                    {badgeText}
                  </Badge>
                </div>
              )}

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

              {customMessage && (
                <p
                  data-editable-field="customMessage"
                  className="mt-4 text-sm text-muted-foreground"
                >
                  {customMessage}
                </p>
              )}
            </div>
          </FadeIn>

          {/* Stripe Pricing Table */}
          <FadeIn delay={0.2}>
            <div className="max-w-6xl mx-auto" data-editable-field="stripePricingTable">
              {content.stripePricingTableId && content.stripePricingTablePublishableKey ? (
                // @ts-ignore - Stripe pricing table custom element
                <stripe-pricing-table
                  pricing-table-id={content.stripePricingTableId}
                  publishable-key={content.stripePricingTablePublishableKey}
                />
              ) : (
                <div className="p-12 rounded-lg border-2 border-dashed border-muted-foreground/20 text-center">
                  <p className="text-muted-foreground">
                    {locale === 'es'
                      ? '⚠️ Configura tu Stripe Pricing Table ID y Publishable Key en las variables de entorno'
                      : '⚠️ Configure your Stripe Pricing Table ID and Publishable Key in environment variables'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID<br />
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  </p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Comparison Table (if enabled) */}
          {content.showComparison && (
            <FadeIn delay={0.3}>
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {locale === 'es'
                    ? '💡 Compara con otros boilerplates: Incluimos todo lo que otros cobran extra'
                    : '💡 Compare with other boilerplates: We include everything others charge extra for'}
                </p>
              </div>
            </FadeIn>
          )}

          {/* Trust indicators */}
          <FadeIn delay={0.4}>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{locale === 'es' ? 'Pago seguro con Stripe' : 'Secure payment with Stripe'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{locale === 'es' ? 'Acceso instantáneo' : 'Instant access'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{locale === 'es' ? 'Actualizaciones de por vida' : 'Lifetime updates'}</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </SectionWrapper>
    </>
  );
}