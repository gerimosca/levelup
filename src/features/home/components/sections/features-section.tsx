import { SectionWrapper } from '@/shared/components/layout';
import type { FeaturesContent } from '../../types/sections';
import { Badge } from '@/shared/components/ui/badge';
import * as Icons from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FeaturesSectionProps {
  content: FeaturesContent;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * Features Section Component
 * Supports multiple layouts: grid, list, carousel, bento, alternating
 * All content externalized and admin-ready
 */
export function FeaturesSection({
  content,
  locale,
  variant = 'A'
}: FeaturesSectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;

  // Dynamic icon component
  const getIconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };

  // Layout classes
  const getLayoutClasses = () => {
    switch (content.layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';
      case 'list':
        return 'space-y-8';
      case 'bento':
        return 'grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]';
      case 'alternating':
        return 'space-y-16';
      default:
        return 'grid grid-cols-1 md:grid-cols-3 gap-8';
    }
  };

  // Feature card component
  const FeatureCard = ({
    feature,
    index
  }: {
    feature: typeof content.features[0];
    index: number;
  }) => {
    const title = getLocalizedText(feature.title);
    const description = getLocalizedText(feature.description);
    const badge = feature.badge ? getLocalizedText(feature.badge) : null;

    // Bento layout special sizing
    const getBentoClasses = () => {
      if (content.layout !== 'bento') return '';
      // Make first and highlighted items larger
      if (index === 0 || feature.highlight) {
        return 'md:col-span-2 md:row-span-2';
      }
      return '';
    };

    // Alternating layout
    if (content.layout === 'alternating') {
      return (
        <div
          className={cn(
            'flex flex-col md:flex-row gap-8 items-center',
            index % 2 === 1 && 'md:flex-row-reverse'
          )}
          data-feature-id={feature.id}
        >
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              {getIconComponent(feature.icon)}
              {badge && (
                <Badge variant="secondary" className="ml-auto">
                  {badge}
                </Badge>
              )}
            </div>
            <h3
              data-editable-field={`features.${index}.title`}
              className="text-2xl font-semibold mb-2"
            >
              {title}
            </h3>
            <p
              data-editable-field={`features.${index}.description`}
              className="text-muted-foreground"
            >
              {description}
            </p>
          </div>
          <div className="flex-1 bg-muted rounded-lg h-64 flex items-center justify-center">
            {/* Placeholder for future image/demo */}
            <span className="text-muted-foreground">
              Feature Demo
            </span>
          </div>
        </div>
      );
    }

    // Card layout (grid, list, bento)
    return (
      <div
        className={cn(
          'group relative p-6 rounded-lg border bg-card hover:shadow-lg transition-all',
          feature.highlight && 'border-primary shadow-sm',
          getBentoClasses()
        )}
        data-feature-id={feature.id}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'p-2 rounded-lg bg-primary/10 text-primary',
              feature.highlight && 'bg-primary text-primary-foreground'
            )}
          >
            {getIconComponent(feature.icon)}
          </div>
          {badge && (
            <Badge
              variant={feature.highlight ? 'default' : 'secondary'}
              className="ml-2"
            >
              {badge}
            </Badge>
          )}
        </div>

        <h3
          data-editable-field={`features.${index}.title`}
          className="text-lg font-semibold mb-2"
        >
          {title}
        </h3>

        <p
          data-editable-field={`features.${index}.description`}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>

        {feature.link && (
          <div className="mt-4">
            <a
              href={feature.link}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Learn more
              <Icons.ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <SectionWrapper
      sectionKey="features"
      variant={variant}
      className="py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
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

        {/* Features Grid/List */}
        <div
          className={getLayoutClasses()}
          data-editable-field="features"
        >
          {content.features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}