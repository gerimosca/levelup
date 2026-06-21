# App (Next.js App Router)

Estructura de rutas y páginas de la aplicación.

## Estructura

```
/app
├── [locale]/                    # Routing i18n
│   ├── (landing)/               # Páginas públicas
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Landing
│   │   ├── pricing/
│   │   └── about/
│   ├── (app)/                   # Páginas protegidas
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   └── my-account/
│   ├── (auth)/                  # Páginas de auth
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── register/
│   │   └── magic-link/
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Estilos globales
└── api/                         # API routes
    └── webhooks/
        └── stripe/
```

## Route Groups

### `(landing)`
Páginas públicas (landing pages, info, legal).
- Landing page
- Pricing
- About

### `(app)`
Páginas protegidas con layout de app (sidebar).
- Dashboard
- My Account
- Settings

### `(auth)`
Páginas de autenticación con layout mínimo.
- Login
- Register
- Magic Link

## Crear Nueva Página

### Página Pública
```
/src/app/[locale]/(landing)/nueva-pagina/page.tsx
```

### Página Protegida
```typescript
// /src/app/[locale]/(app)/nueva-pagina/page.tsx
import { requireUser } from '@/shared/auth';

export default async function NuevaPage({ params }) {
  const { locale } = await params;
  await requireUser(locale); // Redirect si no auth

  return <div>Contenido protegido</div>;
}
```

## Layouts

### Landing Layout
- Header con navegación
- Footer
- Sin sidebar

### App Layout
- Sidebar con navegación
- Header con usuario
- Requiere autenticación

## Internacionalización

Todas las rutas tienen `[locale]` (en, es).

**Acceder al locale:**
```typescript
export default async function Page({ params }) {
  const { locale } = await params;
  // ...
}
```

**Usar traducciones:**
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

## API Routes

Las API routes van fuera del `[locale]`:
```
/src/app/api/[feature]/route.ts
```

**Ejemplo:**
```typescript
// /src/app/api/users/route.ts
export async function GET() {
  return Response.json({ users: [] });
}
```

## Metadata y SEO

```typescript
import { brand } from '@/shared/config/brand';

export const metadata = {
  title: `Mi Página ${brand.seo.titleTemplate}`,
  description: '...',
};
```
