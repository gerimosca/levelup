Crea una nueva página llamada "$ARGUMENTS" con SEO completo configurado automáticamente.

## Información requerida

Antes de crear, determina:
1. **Tipo de página**: ¿Es landing (pública) o app (protegida)?
2. **Propósito**: Basándote en el nombre, infiere el propósito de la página

## Pasos a ejecutar:

### 1. Crear el archivo de página

**Para páginas landing** (públicas):
Crear en `src/app/[locale]/(landing)/$ARGUMENTS/page.tsx`

**Para páginas app** (protegidas):
Crear en `src/app/[locale]/(app)/$ARGUMENTS/page.tsx`

```typescript
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/shared/lib/metadata';
import type { Locale } from '@/i18n/request';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });

  return generatePageMetadata({
    title: t('$ARGUMENTS.title'),
    description: t('$ARGUMENTS.description'),
    locale: locale as Locale,
    path: '/$ARGUMENTS',
  });
}

export default async function $ARGUMENTS_PASCALPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: '$ARGUMENTS' });

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      {/* TODO: Add page content */}
    </div>
  );
}
```

### 2. Añadir al sitemap (solo páginas landing)

Editar `src/app/sitemap.ts` y añadir en el array `publicPages`:

```typescript
{ path: '/$ARGUMENTS', priority: 0.7, changeFrequency: 'monthly' },
```

Determinar prioridad según importancia:
- 1.0: Landing principal
- 0.9: Pricing, features principales
- 0.7: Páginas secundarias (about, blog, etc.)
- 0.5: Páginas terciarias
- 0.3: Legal (terms, privacy)

### 3. Añadir traducciones SEO

Genera títulos y descripciones SEO basándote en el nombre de la página.

**En `messages/en.json`**, añadir dentro del objeto `seo`:
```json
"$ARGUMENTS": {
  "title": "[Genera título SEO en inglés - max 60 chars]",
  "description": "[Genera descripción SEO en inglés - max 155 chars]"
}
```

**En `messages/es.json`**, añadir dentro del objeto `seo`:
```json
"$ARGUMENTS": {
  "title": "[Genera título SEO en español - max 60 chars]",
  "description": "[Genera descripción SEO en español - max 155 chars]"
}
```

### 4. Añadir traducciones de contenido

**En `messages/en.json`**, añadir nuevo namespace:
```json
"$ARGUMENTS": {
  "title": "[Título de la página en inglés]"
}
```

**En `messages/es.json`**, añadir nuevo namespace:
```json
"$ARGUMENTS": {
  "title": "[Título de la página en español]"
}
```

## Criterios para generar contenido SEO

### Título SEO (title tag)
- Máximo 60 caracteres
- Incluir keyword principal
- Ser descriptivo y atractivo
- No repetir el nombre del producto (ya está en titleTemplate)

### Meta descripción
- Máximo 155 caracteres
- Incluir call-to-action implícito
- Describir el beneficio para el usuario
- Ser específico sobre el contenido de la página

### Ejemplos por tipo de página:

**Blog**:
- EN: "Latest insights on [topic]. Tips, tutorials, and best practices."
- ES: "Últimas novedades sobre [tema]. Consejos, tutoriales y mejores prácticas."

**Contact**:
- EN: "Get in touch with our team. We're here to help with your questions."
- ES: "Contacta con nuestro equipo. Estamos aquí para resolver tus dudas."

**Features**:
- EN: "Explore all features. Everything you need to [benefit]."
- ES: "Explora todas las funcionalidades. Todo lo que necesitas para [beneficio]."

**Careers**:
- EN: "Join our team. See open positions and help us build the future."
- ES: "Únete a nuestro equipo. Descubre las vacantes disponibles."

## Checklist final

- [ ] Página creada en la ubicación correcta (landing/app)
- [ ] generateMetadata configurado con traducciones
- [ ] Ruta añadida a sitemap.ts (si es landing)
- [ ] Traducciones SEO en en.json y es.json
- [ ] Traducciones de contenido en ambos idiomas
- [ ] npm run type-check pasa

## Notas

- Si la página es de tipo "app", NO añadir al sitemap (son rutas protegidas)
- Las descripciones deben ser únicas para cada página
- Usar lenguaje orientado a beneficios, no características
