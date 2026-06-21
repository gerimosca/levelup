# Shared

Código compartido entre todas las features. Aquí vive la infraestructura base.

## Estructura

```
/shared
├── auth/           # Utilidades de autenticación
├── components/     # Componentes UI reutilizables
├── config/         # Configuración (brand, theme)
├── database/       # Cliente Supabase
├── lib/            # Utilidades (cn, constants)
├── payments/       # Integración Stripe
├── providers/      # React providers
└── types/          # Tipos TypeScript compartidos
```

## Reglas de Importación

- Las features SOLO importan desde `@/shared/*`
- Nunca importar de una feature a otra feature
- Si algo se usa en múltiples features → moverlo a shared

## Carpetas Principales

### `/auth`
Utilidades de sesión y autenticación.
- `getUser()` - Obtener usuario actual (puede ser null)
- `requireUser()` - Requerir usuario (redirect si no existe)

### `/components`
Componentes UI reutilizables.
- `/ui` - Componentes shadcn/ui
- `/layouts` - Layouts de app y marketing

### `/database`
Clientes de Supabase.
- `createClientServer()` - Para Server Components
- `createClientBrowser()` - Para Client Components

### `/payments`
Integración con Stripe.
- Cliente server y browser
- Webhook handler

### `/config`
Configuración centralizada.
- `brand.ts` - Identidad de marca

## Cómo Añadir Código Compartido

1. Crear archivo en la carpeta correspondiente
2. Exportar desde el `index.ts` de la carpeta
3. Importar con `@/shared/...`

**Ejemplo:**
```typescript
// shared/lib/my-util.ts
export function myUtil() { ... }

// shared/lib/index.ts
export { myUtil } from './my-util';

// En una feature
import { myUtil } from '@/shared/lib';
```
