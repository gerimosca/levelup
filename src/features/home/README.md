# Home Feature - Quick Start Guide

## 🚀 Using Home Components

### Basic Usage

```tsx
// In your home page (e.g., app/[locale]/page.tsx)
import { HeroSection, FeaturesSection } from '@/features/home';
import { homeContent } from '@/features/home/config/content';

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <>
      <HeroSection
        content={homeContent.hero.content}
        locale={locale}
      />
      <FeaturesSection
        content={homeContent.features.content}
        locale={locale}
      />
    </>
  );
}
```

## 📝 Adding a New Section

### 1. Define the Type

Add your section type in `types/sections.ts`:

```typescript
export interface YourSectionContent {
  headline: Record<string, string>;
  items: Array<{
    id: string;
    title: Record<string, string>;
    // ... other fields
  }>;
}
```

### 2. Add Content

Add content in `config/content.ts`:

```typescript
export const homeContent = {
  // ... existing sections
  yourSection: {
    id: 'your-section',
    enabled: true,
    order: 6,
    content: {
      headline: {
        en: 'Your Section Title',
        es: 'Título de Tu Sección'
      },
      // ... rest of content
    }
  }
};
```

### 3. Create Component

Create your component in `components/sections/your-section.tsx`:

```tsx
import { SectionWrapper } from '../base/section-wrapper';
import type { YourSectionContent } from '../../types/sections';

export function YourSection({ content, locale, variant = 'A' }) {
  const getLocalizedText = (field: Record<string, string>) => {
    return field[locale] || field.en || '';
  };

  return (
    <SectionWrapper sectionKey="your-section" variant={variant}>
      <h2 data-editable-field="headline">
        {getLocalizedText(content.headline)}
      </h2>
      {/* Your component content */}
    </SectionWrapper>
  );
}
```

## 🎯 Important Rules

### Always Externalize Content
```tsx
// ❌ BAD - Hardcoded content
<h1>Welcome to our SaaS</h1>

// ✅ GOOD - Content from props
<h1>{getLocalizedText(content.headline)}</h1>
```

### Use Data Attributes
```tsx
// These help future admin panel integration
<div data-editable-field="headline">
  {headline}
</div>
```

### Support Multiple Languages
```tsx
// Always use Record<string, string> for text
content: {
  title: {
    en: 'English Title',
    es: 'Título en Español'
  }
}
```

## 🔧 Available Components

### Sections
- `HeroSection` - Main hero with CTAs
- `FeaturesSection` - Feature grid/list/bento
- More sections coming soon...

### Base Components
- `SectionWrapper` - Wrapper with tracking capabilities

### Utilities
- `trackImpression()` - Track section views
- `trackClick()` - Track element clicks
- `trackConversion()` - Track conversions

## 📊 Future Admin Panel

This architecture is designed to support:

1. **Visual Editing**: Admin can edit text directly
2. **A/B Testing**: Create variants and test
3. **Analytics**: Track performance per section
4. **Multi-language**: Edit all languages from one place

When the admin panel is implemented, all components will automatically become editable without any code changes!

## 🤝 Contributing

When adding new sections:
1. Follow the type structure
2. Always externalize content
3. Add data attributes
4. Support multiple languages
5. Update this README

## 📚 Resources

- [Full Documentation](./CLAUDE.md)
- [Types Reference](./types/sections.ts)
- [Content Configuration](./config/content.ts)