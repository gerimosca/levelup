'use client';

import { SectionWrapper } from '@/shared/components/layout';
import type { SocialProofContent, StatItem, TestimonialItem } from '../../types/sections';
import * as Icons from 'lucide-react';
import { FadeIn, NumberTicker } from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

interface SocialProofSectionProps {
  content: SocialProofContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * Social Proof Section Component
 * Shows stats, testimonials, logos, or mixed social proof
 * Admin-ready with full content externalization
 */
export function SocialProofSection({
  content,
  locale,
  variant = 'A'
}: SocialProofSectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = content.headline ? getLocalizedText(content.headline) : null;
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;

  // Render based on type
  const renderContent = () => {
    switch (content.type) {
      case 'stats':
        return renderStats();
      case 'testimonials':
        return renderTestimonials();
      case 'logos':
        return renderLogos();
      case 'mixed':
        return renderMixed();
      default:
        return renderStats();
    }
  };

  const renderStats = () => {
    const statItems = content.items.filter(item => item.type === 'stat');

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        {statItems.map((item, index) => {
          const stat = item.content as StatItem;
          const label = getLocalizedText(stat.label);

          // Parse numeric value for NumberTicker
          const numericValue = parseFloat(stat.value.replace(/[^0-9.-]/g, ''));
          const hasNumberTicker = !isNaN(numericValue);

          return (
            <FadeIn key={item.id} delay={0.1 * (index + 1)}>
              <div
                className="text-center"
                data-editable-field={`items.${index}`}
              >
                {/* Value with animation */}
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.prefix && (
                    <span className="text-primary">{stat.prefix}</span>
                  )}

                  {hasNumberTicker ? (
                    <>
                      <NumberTicker value={numericValue} />
                      {stat.value.replace(/[0-9.-]/g, '')}
                    </>
                  ) : (
                    <span className="text-primary">{stat.value}</span>
                  )}

                  {stat.suffix && (
                    <span className="text-muted-foreground text-3xl">
                      {stat.suffix}
                    </span>
                  )}

                  {/* Trend indicator */}
                  {stat.trend && (
                    <span className="ml-2 inline-block">
                      {stat.trend === 'up' && (
                        <Icons.TrendingUp className="w-6 h-6 text-green-500 inline" />
                      )}
                      {stat.trend === 'down' && (
                        <Icons.TrendingDown className="w-6 h-6 text-red-500 inline" />
                      )}
                    </span>
                  )}
                </div>

                {/* Label */}
                <p className="text-muted-foreground">
                  {label}
                </p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    );
  };

  const renderTestimonials = () => {
    const testimonialItems = content.items.filter(item => item.type === 'testimonial');

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonialItems.map((item, index) => {
          const testimonial = item.content as TestimonialItem;
          const quote = getLocalizedText(testimonial.quote);

          return (
            <FadeIn key={item.id} delay={0.1 * (index + 1)}>
              <div
                className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow"
                data-editable-field={`items.${index}`}
              >
                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Icons.Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < (testimonial.rating ?? 0)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Quote */}
                <blockquote className="text-sm mb-4">
                  &ldquo;{quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {testimonial.avatar && (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icons.User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">
                      {testimonial.author}
                    </div>
                    {(testimonial.role || testimonial.company) && (
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role}
                        {testimonial.role && testimonial.company && ' at '}
                        {testimonial.company}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    );
  };

  const renderLogos = () => {
    const logoItems = content.items.filter(item => item.type === 'logo');

    return (
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-5xl mx-auto">
        {logoItems.map((item, index) => (
          <FadeIn key={item.id} delay={0.1 * (index + 1)}>
            <div
              className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
              data-editable-field={`items.${index}`}
            >
              {/* Placeholder for logo - in real app would be an image */}
              <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground font-semibold">
                {(item.content as any).name}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    );
  };

  const renderMixed = () => {
    // For mixed type, render stats prominently and testimonials below
    return (
      <div className="space-y-12">
        {renderStats()}
        {content.items.some(item => item.type === 'testimonial') && (
          <div className="border-t pt-12">
            {renderTestimonials()}
          </div>
        )}
      </div>
    );
  };

  return (
    <SectionWrapper
      sectionKey="social-proof"
      variant={variant}
      className="py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(headline || subheadline) && (
          <FadeIn delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <h2
                  data-editable-field="headline"
                  className="text-3xl md:text-4xl font-bold mb-4"
                >
                  {headline}
                </h2>
              )}

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
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </SectionWrapper>
  );
}