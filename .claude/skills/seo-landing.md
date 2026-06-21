# Skill: Crear Landing Page SEO

Guía para crear landing pages SEO-optimizadas para nuevas features, con keywords y soporte multilanguage.

## Cuándo Usar

Después de completar una nueva feature (junto con los tests), crear una landing page en la sección de landing para:
- Mejorar posicionamiento en buscadores
- Atraer tráfico orgánico a la feature
- Explicar beneficios a usuarios potenciales

## Estructura Final

```
/src/app/[locale]/(landing)/features/[feature-slug]/
├── page.tsx                 # Página principal
└── metadata.ts              # (opcional) metadata separada

/messages/
├── en.json                  # Traducciones inglés
└── es.json                  # Traducciones español
```

## Paso 1: Investigar Keywords

Antes de crear la landing, identificar:

1. **Keyword principal**: Término que describe la feature (ej: "team collaboration tool")
2. **Keywords secundarias**: Variaciones y long-tail (ej: "real-time team collaboration", "project collaboration software")
3. **Intent keywords**: Qué busca el usuario (ej: "how to collaborate with remote team")

### Herramientas sugeridas
- Google Keyword Planner
- Ahrefs/SEMrush
- Answer the Public
- Google autocomplete

### Documentar keywords

```typescript
// Comentario al inicio del page.tsx
/**
 * SEO Keywords:
 * - Primary: "team collaboration tool"
 * - Secondary: "real-time collaboration", "project management"
 * - Long-tail: "best team collaboration tool for startups"
 */
```

## Paso 2: Crear Ruta de la Página

**`/src/app/[locale]/(landing)/features/[feature-slug]/page.tsx`**

```typescript
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { type Metadata } from 'next';
import { brand } from '@/shared/config/brand';

type Props = {
  params: Promise<{ locale: string }>;
};

// Metadata con keywords
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'features.[feature]' });

  const title = t('meta.title');
  const description = t('meta.description');

  return {
    title,
    description,
    keywords: t('meta.keywords'),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${brand.company.website}/${locale}/features/[feature-slug]`,
      images: [
        {
          url: `${brand.company.website}/og/[feature-slug].png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${brand.company.website}/${locale}/features/[feature-slug]`,
      languages: {
        en: `${brand.company.website}/en/features/[feature-slug]`,
        es: `${brand.company.website}/es/features/[feature-slug]`,
      },
    },
  };
}

export default async function FeatureLandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('features.[feature]');

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: t('meta.title'),
            description: t('meta.description'),
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-sm font-medium text-primary mb-4 block">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('hero.description')}
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
              >
                {t('hero.cta')}
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 border rounded-lg font-medium hover:bg-accent transition"
              >
                {t('hero.secondaryCta')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {t('problem.title')}
            </h2>
            <p className="text-lg text-muted-foreground text-center">
              {t('problem.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Solution/Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {t('solution.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('solution.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-lg border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {/* Icon here */}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t(`solution.features.${i}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`solution.features.${i}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {t('howItWorks.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">
                  {t(`howItWorks.steps.${step}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`howItWorks.steps.${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('cta.description')}
            </p>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition"
            >
              {t('cta.button')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
```

## Paso 3: Añadir Traducciones

### English (`messages/en.json`)

```json
{
  "features": {
    "[feature]": {
      "meta": {
        "title": "[Feature Name] - Build Faster with [Brand]",
        "description": "Discover how [feature] helps you [main benefit]. [Secondary benefit]. Start free today.",
        "keywords": "primary keyword, secondary keyword, long-tail keyword"
      },
      "hero": {
        "badge": "New Feature",
        "title": "[Main Benefit] with [Feature Name]",
        "description": "Longer description explaining the value proposition and how it solves user problems. Include keywords naturally.",
        "cta": "Get Started Free",
        "secondaryCta": "See How It Works"
      },
      "problem": {
        "title": "The Challenge",
        "description": "Describe the pain point your feature solves. Be specific about the problem users face without this feature."
      },
      "solution": {
        "title": "The Solution",
        "description": "How your feature addresses these challenges",
        "features": {
          "1": {
            "title": "Feature Benefit 1",
            "description": "Explain how this specific aspect helps users achieve their goals."
          },
          "2": {
            "title": "Feature Benefit 2",
            "description": "Another key benefit with specific, tangible outcomes."
          },
          "3": {
            "title": "Feature Benefit 3",
            "description": "Third benefit focusing on differentiation from alternatives."
          }
        }
      },
      "howItWorks": {
        "title": "How It Works",
        "steps": {
          "1": {
            "title": "Step One",
            "description": "First action user takes"
          },
          "2": {
            "title": "Step Two",
            "description": "Second action in the flow"
          },
          "3": {
            "title": "Step Three",
            "description": "Final step and outcome"
          }
        }
      },
      "cta": {
        "title": "Ready to [Main Benefit]?",
        "description": "Join thousands of users who are already [achieving outcome] with [Feature Name].",
        "button": "Start Free Trial"
      }
    }
  }
}
```

### Spanish (`messages/es.json`)

```json
{
  "features": {
    "[feature]": {
      "meta": {
        "title": "[Nombre Feature] - Construye más rápido con [Brand]",
        "description": "Descubre cómo [feature] te ayuda a [beneficio principal]. [Beneficio secundario]. Comienza gratis hoy.",
        "keywords": "keyword principal, keyword secundaria, keyword long-tail"
      },
      "hero": {
        "badge": "Nueva función",
        "title": "[Beneficio principal] con [Nombre Feature]",
        "description": "Descripción más larga explicando la propuesta de valor y cómo resuelve los problemas del usuario. Incluir keywords de forma natural.",
        "cta": "Comenzar gratis",
        "secondaryCta": "Ver cómo funciona"
      },
      "problem": {
        "title": "El desafío",
        "description": "Describe el problema que tu feature resuelve. Sé específico sobre el problema que enfrentan los usuarios sin esta función."
      },
      "solution": {
        "title": "La solución",
        "description": "Cómo tu feature aborda estos desafíos",
        "features": {
          "1": {
            "title": "Beneficio 1",
            "description": "Explica cómo este aspecto específico ayuda a los usuarios a lograr sus objetivos."
          },
          "2": {
            "title": "Beneficio 2",
            "description": "Otro beneficio clave con resultados específicos y tangibles."
          },
          "3": {
            "title": "Beneficio 3",
            "description": "Tercer beneficio enfocado en la diferenciación de alternativas."
          }
        }
      },
      "howItWorks": {
        "title": "Cómo funciona",
        "steps": {
          "1": {
            "title": "Paso uno",
            "description": "Primera acción del usuario"
          },
          "2": {
            "title": "Paso dos",
            "description": "Segunda acción en el flujo"
          },
          "3": {
            "title": "Paso tres",
            "description": "Paso final y resultado"
          }
        }
      },
      "cta": {
        "title": "¿Listo para [beneficio principal]?",
        "description": "Únete a miles de usuarios que ya están [logrando resultado] con [Nombre Feature].",
        "button": "Comenzar prueba gratis"
      }
    }
  }
}
```

## Paso 4: Crear OG Image

Crear imagen Open Graph para social sharing:

1. **Dimensiones**: 1200x630 pixels
2. **Contenido**: Título de la feature + visual
3. **Ubicación**: `/public/og/[feature-slug].png`

Herramientas sugeridas:
- Figma con template OG
- Vercel OG Image generation
- Canva

## Paso 5: SEO Checklist

Antes de publicar, verificar:

### Contenido
- [ ] Título H1 incluye keyword principal
- [ ] Meta description < 160 caracteres con keyword
- [ ] Keywords en primeros 100 palabras
- [ ] Alt text en imágenes con keywords
- [ ] Links internos a páginas relacionadas

### Técnico
- [ ] URL slug limpio y descriptivo
- [ ] Canonical URL configurada
- [ ] hreflang para multilanguage
- [ ] JSON-LD structured data válido
- [ ] OG image creada y configurada

### Mobile
- [ ] Texto legible sin zoom
- [ ] Botones con touch target >= 44px
- [ ] Carga < 200ms (principio UX)

### Validación
```bash
# Validar structured data
https://search.google.com/test/rich-results

# Validar OG tags
https://www.opengraph.xyz/
```

## Mejores Prácticas

### Keywords
- **No keyword stuffing**: Usar keywords de forma natural
- **Densidad**: 1-2% del contenido
- **Variaciones**: Usar sinónimos y variaciones
- **Long-tail**: Incluir frases específicas

### Contenido
- **Resolver problemas**: Enfocarse en beneficios, no features
- **Scaneable**: Headers claros, párrafos cortos, bullets
- **Unique value**: Qué te diferencia de la competencia
- **Social proof**: Testimonios, números, casos de uso

### Multilanguage
- **No traducir literalmente**: Adaptar al mercado
- **Keywords locales**: Investigar para cada idioma
- **Cultural context**: Ajustar ejemplos y referencias

## Ejemplo Completo

Ver landing de ejemplo en:
- `/src/app/[locale]/(landing)/features/analytics/page.tsx`
- Traducciones en `messages/en.json` y `messages/es.json` bajo `features.analytics`
