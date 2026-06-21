# Home Feature - Admin-Ready Architecture

## 🎯 Objetivo

Todos los componentes de la home deben ser "admin-ready" desde el día 1, preparados para edición desde admin panel y A/B testing sin refactoring.

## 📐 Arquitectura Admin-Ready

### Principio Core: "Content as Data"

**NUNCA** hardcodear contenido en componentes. **SIEMPRE** usar una estructura de datos que pueda venir de:
1. Archivo de configuración (ahora)
2. Base de datos (futuro)
3. Admin panel (futuro)

### Estructura de Componentes

Cada componente de home debe seguir este patrón:

```typescript
// ❌ MAL - Contenido hardcodeado
export function HeroSection() {
  return (
    <section>
      <h1>Build Your SaaS 10x Faster</h1>
      <p>The AI-native boilerplate...</p>
    </section>
  );
}

// ✅ BIEN - Content as Data
interface HeroSectionProps {
  content: HeroContent;
  locale: string;
  variant?: 'A' | 'B';
  trackingId?: string;
}

export function HeroSection({ content, locale, variant = 'A' }: HeroSectionProps) {
  const t = content[locale] || content.en; // Fallback a inglés

  return (
    <section data-variant={variant} data-tracking="hero">
      <h1>{t.headline}</h1>
      <p>{t.subheadline}</p>
    </section>
  );
}
```

## 📁 Estructura de Archivos

```
/src/features/home/
├── CLAUDE.md                    # Este archivo
├── types/
│   └── sections.ts              # Tipos para cada sección
├── config/
│   └── content.ts               # Contenido actual (migrable a DB)
├── components/
│   ├── sections/                # Componentes de secciones
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── social-proof-section.tsx
│   │   ├── pricing-section.tsx
│   │   └── cta-section.tsx
│   └── base/                    # Componentes base reutilizables
│       ├── section-wrapper.tsx  # Wrapper con tracking
│       └── editable-text.tsx    # Texto editable (futuro)
└── lib/
    ├── content-loader.ts        # Carga content (file → DB futuro)
    └── tracking.ts              # Tracking preparado
```

## 🔧 Tipos Obligatorios

### 1. Tipo Base para Secciones

```typescript
// /src/features/home/types/sections.ts

// Base para todas las secciones
export interface SectionContent<T = any> {
  id: string;
  enabled: boolean;
  order: number;
  variant?: 'A' | 'B';
  content: T;
  metadata?: {
    lastModified?: string;
    modifiedBy?: string;
    performance?: {
      impressions: number;
      conversions: number;
    };
  };
}

// Hero Section
export interface HeroContent {
  headline: Record<string, string>; // { en: "...", es: "..." }
  subheadline: Record<string, string>;
  ctaPrimary: {
    text: Record<string, string>;
    href: string;
    style?: 'default' | 'destructive' | 'outline';
  };
  ctaSecondary?: {
    text: Record<string, string>;
    href: string;
  };
  backgroundImage?: string;
  backgroundVideo?: string;
  trustBadges?: string[];
}

// Features Section
export interface FeaturesContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  layout: 'grid' | 'list' | 'carousel' | 'bento';
  features: Array<{
    id: string;
    icon: string; // Icon name o URL
    title: Record<string, string>;
    description: Record<string, string>;
    highlight?: boolean;
    link?: string;
  }>;
}

// Social Proof Section
export interface SocialProofContent {
  type: 'logos' | 'testimonials' | 'stats' | 'mixed';
  headline?: Record<string, string>;
  items: Array<{
    id: string;
    type: 'logo' | 'testimonial' | 'stat';
    content: any; // Específico por tipo
  }>;
}

// Pricing Section
export interface PricingContent {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  stripePricingTableId: string;
  showComparison?: boolean;
  customMessage?: Record<string, string>;
}
```

## 🏗️ Content Configuration (Temporal)

```typescript
// /src/features/home/config/content.ts

import type { HeroContent, FeaturesContent, SocialProofContent, PricingContent } from '../types/sections';

// Este archivo será reemplazado por base de datos en el futuro
// Pero la estructura debe ser idéntica a lo que vendrá de DB

export const homeContent = {
  hero: {
    id: 'hero-main',
    enabled: true,
    order: 1,
    content: {
      headline: {
        en: "Ship Your AI SaaS 10x Faster",
        es: "Lanza tu SaaS con IA 10x Más Rápido"
      },
      subheadline: {
        en: "Production-ready boilerplate with auth, billing, and admin panel",
        es: "Boilerplate listo para producción con auth, billing y panel admin"
      },
      ctaPrimary: {
        text: {
          en: "Start Free Trial",
          es: "Prueba Gratis"
        },
        href: "/register",
        style: "default"
      },
      ctaSecondary: {
        text: {
          en: "View Demo",
          es: "Ver Demo"
        },
        href: "/demo"
      }
    } as HeroContent
  },

  features: {
    id: 'features-main',
    enabled: true,
    order: 2,
    content: {
      headline: {
        en: "Everything You Need to Launch",
        es: "Todo lo que Necesitas para Lanzar"
      },
      layout: 'grid',
      features: [
        {
          id: 'auth',
          icon: 'Shield',
          title: {
            en: "Authentication Ready",
            es: "Autenticación Lista"
          },
          description: {
            en: "Magic links, OAuth, and email/password",
            es: "Magic links, OAuth, y email/contraseña"
          },
          highlight: true
        }
        // ... más features
      ]
    } as FeaturesContent
  },

  // ... más secciones
};
```

## 🎨 Patrón de Componente

### Componente Wrapper Base

```typescript
// /src/features/home/components/base/section-wrapper.tsx

interface SectionWrapperProps {
  sectionKey: string;
  variant?: 'A' | 'B';
  className?: string;
  children: React.ReactNode;
}

export function SectionWrapper({
  sectionKey,
  variant = 'A',
  className,
  children
}: SectionWrapperProps) {
  // Preparado para tracking
  useEffect(() => {
    // Futuro: trackImpression(sectionKey, variant);
  }, [sectionKey, variant]);

  return (
    <section
      data-section={sectionKey}
      data-variant={variant}
      data-editable="true" // Para futuro admin panel
      className={className}
    >
      {children}
    </section>
  );
}
```

### Ejemplo de Sección

```typescript
// /src/features/home/components/sections/hero-section.tsx

import { SectionWrapper } from '../base/section-wrapper';
import type { HeroContent } from '../../types/sections';

interface HeroSectionProps {
  content: HeroContent;
  locale: string;
  variant?: 'A' | 'B';
}

export function HeroSection({ content, locale, variant = 'A' }: HeroSectionProps) {
  const t = content[locale] || content.en;

  return (
    <SectionWrapper sectionKey="hero" variant={variant}>
      <div className="container mx-auto px-4 py-20">
        <h1
          data-editable-field="headline"
          className="text-5xl font-bold"
        >
          {t.headline}
        </h1>

        <p
          data-editable-field="subheadline"
          className="text-xl text-muted-foreground mt-4"
        >
          {t.subheadline}
        </p>

        <div className="flex gap-4 mt-8">
          <Button
            data-editable-field="ctaPrimary"
            asChild
          >
            <Link href={content.ctaPrimary.href}>
              {t.ctaPrimary.text}
            </Link>
          </Button>

          {content.ctaSecondary && (
            <Button
              data-editable-field="ctaSecondary"
              variant="outline"
              asChild
            >
              <Link href={content.ctaSecondary.href}>
                {t.ctaSecondary.text}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
```

## 📊 Preparación para Tracking

```typescript
// /src/features/home/lib/tracking.ts

// Preparado pero no implementado aún
export async function trackImpression(
  sectionKey: string,
  variant: string = 'A'
) {
  // TODO: Implementar cuando tengamos DB
  console.log(`[Future] Track impression: ${sectionKey}-${variant}`);
}

export async function trackClick(
  sectionKey: string,
  element: string,
  variant: string = 'A'
) {
  // TODO: Implementar cuando tengamos DB
  console.log(`[Future] Track click: ${sectionKey}-${element}-${variant}`);
}

export async function trackConversion(
  sectionKey: string,
  conversionType: string,
  variant: string = 'A'
) {
  // TODO: Implementar cuando tengamos DB
  console.log(`[Future] Track conversion: ${sectionKey}-${conversionType}-${variant}`);
}
```

## 🚀 Uso en Home Page

```typescript
// /src/app/[locale]/(marketing)/page.tsx

import { homeContent } from '@/features/home/config/content';
import { HeroSection } from '@/features/home/components/sections/hero-section';
import { FeaturesSection } from '@/features/home/components/sections/features-section';

export default async function HomePage() {
  const locale = await getLocale();

  // Futuro: const content = await getHomeContent();
  // Por ahora:
  const content = homeContent;

  return (
    <>
      {content.hero.enabled && (
        <HeroSection
          content={content.hero.content}
          locale={locale}
          variant="A" // Futuro: desde cookies/DB
        />
      )}

      {content.features.enabled && (
        <FeaturesSection
          content={content.features.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Más secciones... */}
    </>
  );
}
```

## ✅ Checklist para Nuevos Componentes

Cuando añadas un componente a la home:

### 1. Define el tipo
- [ ] Crear interface en `/types/sections.ts`
- [ ] Incluir soporte multiidioma (Record<string, string>)
- [ ] Añadir campos de metadata

### 2. Añade contenido de prueba
- [ ] Añadir en `/config/content.ts`
- [ ] Incluir traducciones EN y ES
- [ ] Marcar como `enabled: true`

### 3. Crea el componente
- [ ] Usar `SectionWrapper`
- [ ] Añadir `data-editable-field` a elementos editables
- [ ] Recibir content como prop, NO hardcodear
- [ ] Soportar prop `variant`

### 4. Documenta
- [ ] Actualizar este CLAUDE.md
- [ ] Añadir ejemplo de uso
- [ ] Documentar campos editables

## 🔮 Migración Futura a Admin Panel

Cuando implementemos el admin panel:

### Fase 1: Database
```sql
-- Ya definido arriba, solo ejecutar migraciones
CREATE TABLE home_sections (...);
```

### Fase 2: Migration Script
```typescript
// Script para migrar content.ts → database
import { homeContent } from '@/features/home/config/content';

async function migrateContentToDB() {
  for (const [key, section] of Object.entries(homeContent)) {
    await supabase.from('home_sections').insert({
      section_key: key,
      variant: 'A',
      content: section.content,
      // ...
    });
  }
}
```

### Fase 3: Replace Loader
```typescript
// Cambiar content-loader.ts para leer de DB
export async function getHomeContent() {
  // Before: return homeContent;
  // After:
  return supabase.from('home_sections').select('*');
}
```

### Fase 4: Admin UI
- El admin panel podrá encontrar componentes por `data-editable="true"`
- Los campos editables por `data-editable-field`
- Guardar cambios directo a DB
- A/B testing activado

## 🚨 Reglas Críticas

1. **NUNCA** hardcodear texto en componentes
2. **SIEMPRE** usar tipos tipados para content
3. **SIEMPRE** incluir traducciones desde el día 1
4. **SIEMPRE** usar SectionWrapper para tracking futuro
5. **SIEMPRE** pensar "¿cómo editaría esto desde admin?"

## 💡 Beneficios de este Approach

- ✅ Zero refactoring cuando añadamos admin panel
- ✅ A/B testing listo desde día 1
- ✅ Traducciones organizadas
- ✅ Performance tracking preparado
- ✅ Contenido versionable (git ahora, DB después)
- ✅ Preview fácil de implementar
- ✅ Componentes reutilizables

## 📝 Notas para el Desarrollador

- Los `data-*` attributes no afectan performance
- El content como JSON es eficiente y cacheable
- Esta estructura soporta SSG/ISR sin cambios
- Compatible con Edge Runtime
- Los tipos garantizan consistencia

---

**Próximo paso**: Cuando creemos cualquier componente para home, seguir este patrón.

---

## 🚀 FUTURO: AI Home Page Builder

> **Estado**: Planificado - No implementado aún

### Concepto

Durante el setup, el usuario describe su negocio en 2-3 oraciones y la AI:
1. Decide qué secciones activar (de 11 disponibles)
2. Elige el layout óptimo por sección
3. Genera contenido EN/ES para cada sección
4. Configura el orden de secciones

### Arquitectura Propuesta

```
src/core/features/home/config/
├── content.ts              # Estructura estática + merge
├── editable-content.json   # Textos EN/ES (ya existe)
├── home-config.json        # NUEVO: enabled/order/layout por sección
└── home-config.backup.json # Auto-generado en cada update

src/core/features/home/types/
├── sections.ts             # Tipos existentes
└── home-config.ts          # NUEVO: Zod schema para validación
```

### Flujo del Setup

```
Usuario: "Ayudamos a equipos de marketing a automatizar redes sociales con AI..."

AI Recommendations:
  ✓ hero - Main headline and CTA
  ✓ problemSolution - Before/after comparison
  ✓ features (bento) - Key capabilities
  ✓ howItWorks (timeline) - Step-by-step guide
  ○ techStack - (disabled: not dev-focused)
  ✓ socialProof - Stats and credibility
  ✓ pricing - Pricing table
  ○ urgency - (disabled: B2B product)
  ✓ faq (accordion) - Common questions
  ✓ cta (gradient) - Final call to action

Apply this configuration? (Y/n)
```

### Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `config/home-config.json` | CREAR - Config de secciones |
| `types/home-config.ts` | CREAR - Zod schema |
| `config/content.ts` | MODIFICAR - Import + merge |
| `scripts/lib/ai-copy-generator.mjs` | MODIFICAR - Nueva función AI |
| `scripts/setup-copy.mjs` | MODIFICAR - Nuevo flujo wizard |

### Beneficios

- **AI decide todo**: Una descripción → home completa
- **Type-safe**: Zod valida en build time
- **Reversible**: Backup automático + git
- **Escalable**: Agregar secciones es trivial
- **Compatible con A/B**: La estructura de variants se mantiene

### Plan Detallado

Ver: `~/.claude/plans/graceful-conjuring-sparkle.md`