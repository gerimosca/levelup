'use client';

import { SectionWrapper } from '@/shared/components/layout';
import type { TechStackContent } from '../../types/sections';
import * as Icons from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { FadeIn } from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

interface TechStackSectionProps {
  content: TechStackContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * Tech Stack Section Component
 * Shows the modern technologies used in the boilerplate
 * Admin-ready with full content externalization
 */
export function TechStackSection({
  content,
  locale,
  variant = 'A'
}: TechStackSectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;

  // Get icon/logo component - map common tech names to icons
  const getTechIcon = (logoName?: string) => {
    if (!logoName) return null;

    // Map tech names to Lucide icons
    const iconMap: Record<string, any> = {
      'NextJS': Icons.Globe,
      'React': Icons.Component,
      'TypeScript': Icons.FileCode,
      'TailwindCSS': Icons.Palette,
      'Supabase': Icons.Database,
      'PostgreSQL': Icons.Database,
      'Stripe': Icons.CreditCard,
      'Mail': Icons.Mail,
      'Bot': Icons.Bot,
      'Component': Icons.Component,
      'Sparkles': Icons.Sparkles,
      'TestTube': Icons.TestTube,
    };

    const IconComponent = iconMap[logoName] || Icons.Box;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <SectionWrapper
      sectionKey="tech-stack"
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

        {/* Tech Categories */}
        <div className="max-w-6xl mx-auto space-y-8">
          {content.categories.map((category, catIndex) => (
            <FadeIn key={category.id} delay={0.1 * (catIndex + 1)}>
              <div data-editable-field={`categories.${catIndex}`}>
                {/* Category Name */}
                <h3 className="text-lg font-semibold mb-4 text-center md:text-left">
                  {getLocalizedText(category.name)}
                </h3>

                {/* Technologies Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {category.technologies.map((tech, techIndex) => (
                    <div
                      key={`${category.id}-${techIndex}`}
                      className="group relative p-4 rounded-lg bg-background border hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                      data-editable-field={`categories.${catIndex}.technologies.${techIndex}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon/Logo */}
                        <div className="flex-shrink-0 text-primary">
                          {getTechIcon(tech.logo)}
                        </div>

                        {/* Tech Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {tech.name}
                            </span>
                            {content.showVersions && tech.version && (
                              <span className="text-xs text-muted-foreground">
                                v{tech.version}
                              </span>
                            )}
                          </div>

                          {/* Badge */}
                          {tech.badge && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-xs"
                            >
                              {getLocalizedText(tech.badge)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom message */}
        <FadeIn delay={0.5}>
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              {locale === 'es'
                ? '✨ Todas las dependencias actualizadas y optimizadas para producción'
                : '✨ All dependencies updated and optimized for production'}
            </p>
          </div>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}