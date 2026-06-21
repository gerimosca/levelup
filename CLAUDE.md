# SaaS Boilerplate - Claude Code Context

## Meta-instrucciones (Eficiencia)

**Criterio experto**:
- No te dejes guiar ciegamente - usa tu juicio técnico
- Cuestiona si algo no tiene sentido o perjudica al producto
- Propón alternativas mejores cuando las veas
- Prioriza: eficiencia del desarrollo > usuario final > petición literal
- Sé honesto sobre trade-offs y consecuencias

**CRÍTICO - Antes de cada tarea**:
- Lee el CLAUDE.md de las features afectadas para tener contexto específico
- Identifica qué patrones aplican
- Revisa si hay deuda técnica relacionada que debas considerar

**Durante la ejecución**:
- Si detectas deuda técnica → Documéntala en el CLAUDE.md de la feature
- Si tomas decisiones arquitectónicas → Añádelas a "Decisiones de Arquitectura"

**Después de cada tarea**:
- Actualiza el CLAUDE.md de la feature si hay nuevo contexto relevante
- Verifica que los casos de testing están actualizados
- Ejecuta tests si es posible

**Periódicamente** (`/audit`):
- Revisa si esta configuración de Claude Code sigue siendo óptima
- Propón mejoras a commands/skills si detectas tareas repetitivas
- Actualiza este CLAUDE.md si hay patrones nuevos no documentados

**Antes de compact/fin de sesión** (`/pre-compact`):
- Evalúa si hay aprendizajes de esta sesión que mejorarían la documentación
- Patrones nuevos → Este CLAUDE.md
- Decisiones/deuda/contexto de features → CLAUDE.md de la feature
- Errores comunes → Troubleshooting en feature correspondiente

**Recursos adicionales**:
- Los README.md en directorios contienen documentación de uso - consúltalos si necesitas contexto de setup, convenciones, o uso de librerías

---

## Principios de Desarrollo

**Simplicidad y seguridad**:
- Busca siempre la solución más simple que funcione
- Menos código = menos bugs = más mantenible
- Evita abstracciones prematuras

**No romper lo previo**:
- Añadir código nuevo antes que modificar existente
- Si hay que modificar, asegurar backwards compatibility
- Tests deben seguir pasando

**Extensible sin editar** (Open/Closed):
- Diseña para que se pueda extender sin modificar código existente
- Usa composición sobre herencia
- Nuevas features = nuevos archivos, no editar los actuales

**YAGNI** (You Ain't Gonna Need It):
- No implementes funcionalidad "por si acaso"
- Implementa lo que se necesita ahora
- Es más fácil añadir después que eliminar

**Velocidad de iteración**:
- Minimizar pasos para probar cambios localmente
- Todo debe ser testeable sin deploy (Stripe CLI, Supabase local)
- Despliegues rápidos y sin fricción
- Si requiere muchos pasos manuales, automatizarlo

---

## Principios UX/UI

**Prioridad absoluta**:
1. Carga < 200ms
2. Clicks tienden a cero
3. Conversiones
4. Perfección visual

**"Un mono debe poder hacerlo"**:
- Auto-explicativo sin instrucciones
- Mínimos clicks posibles (cada click extra = fricción)
- Sin decisiones complejas para el usuario
- Acciones obvias y visibles

**Velocidad real (no trucos)**:
- Todo debe ser rápido por diseño, no por caché
- Optimistic UI siempre (mostrar resultado, revertir si error)
- Prefetch en hover/focus
- NO skeleton loaders si añaden delay - transición instantánea
- Evitar spinners - si algo tarda, el diseño está mal
- Evitar caché y datos mockeados en desarrollo - usar datos reales

**Mobile WOW**:
- Desktop importante, pero mobile debe ser experiencia WOW
- Cada interacción/flow debe generar efecto WOW
- Touch targets generosos
- Gestos naturales donde aplique

**Storytelling > Features**:
- Guiar al usuario con narrativa
- Beneficios antes que funcionalidades
- CTAs orientados a resultado, no acción

**Maximizar conversiones**:
- Un CTA principal por pantalla
- Reducir campos en formularios al mínimo
- Social proof donde sea relevante
- Urgencia/escasez cuando aplique

**Lo que NO hacer**:
- Cosas que no domino y puedan dar problemas
- Animaciones complejas sin propósito
- Modales innecesarios
- Confirmaciones excesivas
- Tooltips como muleta de mal diseño

**Checklist antes de entregar UI**:
- [ ] ¿Puede completarse en menos clicks?
- [ ] ¿Está claro qué hacer sin leer?
- [ ] ¿Hay feedback inmediato en cada acción?
- [ ] ¿Los estados de error son útiles?
- [ ] ¿Funciona en mobile?

---

## Brand Voice & UX Writing

**REGLA CRÍTICA**: NUNCA hardcodear textos. TODO debe venir de copies.

### Sistema de Traducciones: Meta-copies + Route-Level Copies

**Arquitectura en Dos Capas**:

1. **Meta-copies** (Prompts para LLM) → En `features/X/meta-copies/`
2. **Copies finales** (Textos reales) → En `app/[locale]/[ruta]/copies/`

**Estructura**:
```
src/
├── features/auth/
│   ├── meta-copies/
│   │   └── texts.json          # PROMPTS: Qué texto se necesita y por qué
│   └── components/
│
├── app/[locale]/(auth)/login/
│   ├── page.tsx
│   └── copies/
│       ├── en.json              # TEXTOS FINALES
│       └── es.json
│
└── app/[locale]/_shared/ui/
    └── copies/
        ├── en.json              # UI compartida (save, cancel, etc.)
        └── es.json
```

### Meta-copies: Prompts para LLM

Los meta-copies **NO son textos finales**. Son **instrucciones** para que un LLM (Claude) genere los textos.

**Ejemplo** (`features/auth/meta-copies/texts.json`):
```json
{
  "login": {
    "title": "Page title for login. Keep it welcoming. Ex: 'Welcome back'",
    "email": "Email input label. Keep it simple and clear.",
    "password": "Password input label. Standard form label.",
    "submit": "Login button text. Be action-oriented. Ex: 'Sign in', 'Log in'"
  }
}
```

**Claude lee esto + `shared/config/brand.ts`** y genera:

```json
// app/[locale]/(auth)/login/copies/en.json (GENERADO)
{
  "title": "Welcome back!",
  "email": "Email",
  "password": "Password",
  "submit": "Sign in"
}
```

### Copies Finales: Route-Level

Los copies finales viven en **app router**, no en features.

**Por qué**:
- Copies dependen de **dónde se usan** (contexto de la ruta)
- Mismo componente puede tener diferentes textos en diferentes rutas
- User puede editarlos sin tocar `core/`

**Auto-namespace por Ruta**:
- `app/(auth)/login/copies/` → namespace `"login"`
- `app/(app)/dashboard/copies/` → namespace `"dashboard"`
- `app/(admin)/admin/users/copies/` → namespace `"admin-users"`
- `app/_shared/ui/copies/` → namespace `"ui"`

**Uso en componentes**:
```typescript
// En login page
const t = useTranslations('login'); // Lee de app/(auth)/login/copies/
t('title') // "Welcome back!"

// En componente compartido
const t = useTranslations('ui'); // Lee de app/_shared/ui/copies/
t('save') // "Save"
```

### Flujo: Generar Copies

**1. Claude lee meta-copies**:
```bash
# User: "Generate copies for login page"
# Claude lee:
# - features/auth/meta-copies/texts.json (prompts)
# - shared/config/brand.ts (contexto del negocio)
```

**2. Claude genera copies**:
```json
// app/(auth)/login/copies/en.json (GENERADO por Claude)
{
  "title": "Welcome to TaskMaster!",  // Usa brand.name
  "email": "Your email",
  "password": "Password",
  "submit": "Sign in to your account"
}
```

**3. User edita si quiere**:
```json
// User puede editar manualmente
{
  "title": "Hey there! 👋",  // ← Personalizado
  ...
}
```

**4. Traducir a otros idiomas**:
```bash
# Claude lee en.json como source + meta-copies para contexto
# Genera es.json, fr.json, etc.
```

### Principios de Copy

**Beneficio > Función**:
```json
// ❌ MAL
"submit": "Submit"

// ✅ BIEN
"submit": "Create my project"
```

**Acción clara y específica**:
```json
// ❌ MAL
"created": "Item created successfully"

// ✅ BIEN
"created": "Your project is ready! Start adding tasks now."
```

**Tono conversacional**:
- Usa "tu/tus" en lugar de "el/la"
- Evita jerga técnica innecesaria
- Sé directo pero amable

### Añadir Traducciones a Nueva Ruta

**Caso 1: Ruta usa componentes de core directamente**

```typescript
// app/(app)/settings/page.tsx
import { SettingsForm } from '@/features/my-account';

export default function SettingsPage() {
  return <SettingsForm />;
}
```

```bash
# 1. Claude lee meta-copies de my-account
# 2. Genera copies en app/(app)/settings/copies/en.json
# 3. Componente usa useTranslations('settings')
```

**Caso 2: Ruta con componentes custom**

```typescript
// features/onboarding/page.tsx + custom components
```

```bash
# 1. Crear meta-copies (opcional, solo si componentes complejos):
mkdir -p src/features/onboarding/meta-copies

# 2. Claude genera copies:
# app/(app)/onboarding/copies/en.json
```

### Traducciones Compartidas

**UI Components** (`app/_shared/ui/copies/`):
```json
{
  "save": "Save",
  "cancel": "Cancel",
  "loading": "Loading...",
  "delete": "Delete"
}
```

**Layouts/Nav** (`app/_shared/layouts/copies/`):
```json
{
  "home": "Home",
  "pricing": "Pricing",
  "dashboard": "Dashboard",
  "logout": "Logout"
}
```

### Ejemplos Buenos vs Malos

| Contexto | ❌ Malo | ✅ Bueno |
|----------|---------|----------|
| Empty state | "No hay datos" | "No tienes proyectos aún. Crea tu primero y empieza a organizar ideas" |
| Error | "Error 500" | "Algo salió mal de nuestro lado. Estamos en ello. Intenta en unos minutos" |
| Loading | "Loading..." | "Preparando tu dashboard..." |
| Success | "Saved" | "Cambios guardados. Tu equipo ya puede verlos" |
| CTA | "Submit" | "Crear proyecto" / "Guardar cambios" / "Enviar invitación" |

---

## i18n Automation Scripts

### Propósito

Sistema completo de scripts para automatizar la creación, generación y validación de traducciones. Vive en `/scripts/i18n/` siguiendo VSA (vertical slice architecture).

### Documentación Completa

📖 **Punto de entrada**: `scripts/i18n/00-START-HERE.md`

### Scripts Disponibles

| Script | Propósito | Cuándo Usar |
|--------|-----------|-------------|
| `i18n:create-structure` | Crear archivos vacíos en.json/es.json | Siempre (paso 1) |
| `i18n:generate-ai` | Generar contenido con Claude API desde meta-copies | Si tienes meta-copies |
| `i18n:sync-keys` | Sincronizar keys faltantes EN↔ES | Mantenimiento, después de añadir keys |
| `i18n:validate` | Validar todas las traducciones | Antes de commit, en CI/CD |
| `i18n:generate-static` | **Generar archivos estáticos** (build-time) | **Automático** en dev/build |

### Comandos de Claude (Recomendado)

Para uso interactivo, usa los comandos de Claude que ejecutan estos scripts:

- `/generate-copies --path=<ruta>` - Crear estructura + generar con AI
- `/validate-i18n` - Validar todo el proyecto
- `/sync-i18n` - Sincronizar keys faltantes

**Nota**: Los comandos de Claude aún están por crear (TO CREATE).

### Performance: Build-Time Static Generation

El sistema genera archivos estáticos **automáticamente** antes de dev/build para máximo performance:

**Antes** (legacy):
- 32 archivos JSON leídos del disco en **cada request**
- ~50-100ms de overhead por página ❌

**Ahora** (optimizado):
- Archivos consolidados pre-generados en build
- Import estático: **<1ms** por request ✅
- Mismo comportamiento en dev y prod
- Serverless-friendly (bundled en deployment)

**Regenerar manualmente**:
```bash
npm run i18n:generate-static
```

### Workflow Típico

**Crear nueva página con traducciones**:

```bash
# 1. Crear estructura vacía
npm run i18n:create-structure -- --path=app/[locale]/(landing)/pricing

# 2. Opción A: Generar con AI (si tienes meta-copies)
npm run i18n:generate-ai -- \
  --source=src/features/home/meta-copies \
  --target=src/app/[locale]/(landing)/pricing

# 2. Opción B: Editar manualmente
# Edita: app/[locale]/(landing)/pricing/copies/en.json
# Edita: app/[locale]/(landing)/pricing/copies/es.json

# 3. Regenerar archivos estáticos
npm run i18n:generate-static

# 4. Validar
npm run i18n:validate
```

**Editar traducciones existentes**:
```bash
# 1. Editar archivos en copies/
vim app/[locale]/(landing)/pricing/copies/en.json

# 2. Regenerar estáticos
npm run i18n:generate-static

# 3. El dev server recarga automáticamente
```

**Sincronizar traducciones**:

```bash
# Ver qué falta sin cambiar archivos
npm run i18n:sync-keys -- --dry-run

# Sincronizar con placeholders
npm run i18n:sync-keys

# Sincronizar con traducción AI
npm run i18n:sync-keys -- --ai
```

### Estructura del Sistema

```
scripts/i18n/
├── 00-START-HERE.md              # Documentación de entrada
├── agent/                         # Referencias a comandos de Claude
│   ├── README.md
│   ├── 01-generate-copies.txt
│   ├── 02-validate-translations.txt
│   └── 03-sync-translation-keys.txt
├── generators/
│   ├── step-1-create-translation-structure.mjs
│   ├── step-2-generate-content-with-ai.mjs
│   └── step-3-sync-missing-keys.mjs
├── validation/
│   └── validate-all-translations.mjs
└── lib/
    ├── error-handler.mjs
    ├── anthropic-client.mjs
    ├── namespace-detector.mjs
    └── brand-loader.mjs
```

### Exit Codes (para CI/CD)

Los scripts usan exit codes estándar para integración en pipelines:

- `0` - Success
- `1` - Validation error / Invalid arguments
- `2` - Source files not found
- `3` - Filesystem error
- `4` - API error (Anthropic)
- `5` - Target validation failed

### Requisitos

**Para crear estructura (step-1)**:
- Node.js >= 20.9.0

**Para generar con AI (step-2)**:
- Variable de entorno: `ANTHROPIC_API_KEY`
- Meta-copies en `features/*/meta-copies/texts.json`

**Para sincronizar con AI (step-3 --ai)**:
- Variable de entorno: `ANTHROPIC_API_KEY`

### Pre-commit Hook

El proyecto tiene configurado un pre-commit hook con Husky que valida automáticamente:

1. ✅ Type check (`npm run type-check`)
2. ✅ Lint (`npm run lint`)
3. ✅ **Translations (`npm run i18n:validate`)** ← Añadido

**Ubicación**: `.husky/pre-commit`

**Comportamiento**:
- Se ejecuta automáticamente antes de cada commit
- Si alguna validación falla, el commit se bloquea
- Muestra claramente qué está fallando
- Bypass con `git commit --no-verify` (solo si es absolutamente necesario)

**Ejemplo de output cuando falla i18n**:
```
🌐 Validating translations...

❌ Errors found:
1. app/[locale]/(landing)/pricing/copies
   Missing translation files: es

❌ Translation validation failed!
💡 Fix the errors above or use 'git commit --no-verify' to skip
```

### Ejemplos Avanzados

**Generar para múltiples páginas**:
```bash
# Crear estructura para varias páginas
for page in about contact blog; do
  npm run i18n:create-structure -- --path=app/[locale]/(landing)/$page
done

# Validar todo
npm run i18n:validate
```

**CI/CD Integration**:
```yaml
# .github/workflows/validate.yml
- name: Validate translations
  run: npm run i18n:validate
```

---

## Accesibilidad (A11y)

### Requisitos Obligatorios

**Semántica HTML**:
- Un solo `<h1>` por página
- Jerarquía lógica: h1 → h2 → h3 (sin saltos)
- Landmarks: `<main>`, `<nav>`, `<aside>`, `<footer>`
- Listas para grupos de items relacionados

**Formularios Accesibles**:
```typescript
// SIEMPRE incluir estos atributos
<div>
  <Label htmlFor="email">{t('form.email.label')}</Label>
  <Input
    id="email"
    name="email"
    type="email"
    aria-describedby="email-help email-error"
    aria-invalid={!!error}
    aria-required="true"
  />
  <p id="email-help" className="text-sm text-muted-foreground">
    {t('form.email.help')}
  </p>
  {error && (
    <p id="email-error" role="alert" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>
```

**Feedback Dinámico con ARIA Live**:
```typescript
// Para toasts, notificaciones, errores que aparecen
<div aria-live="polite" aria-atomic="true">
  {message}
</div>

// Para errores críticos
<div role="alert" aria-live="assertive">
  {criticalError}
</div>
```

**Navegación por Teclado**:
- Todo interactivo debe ser focusable (Tab)
- Orden de tab lógico (no usar tabindex > 0)
- Focus visible claro (no solo outline por defecto)
- Escape cierra modals/dropdowns
- Enter/Space activan buttons

**Preferencias del Usuario**:
```css
/* OBLIGATORIO en animaciones */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Checklist A11y por Componente

**Buttons**:
- [ ] Texto descriptivo (no solo "Click here")
- [ ] `aria-label` si solo tiene icono
- [ ] Estado disabled visible y anunciado
- [ ] Focus ring visible

**Forms**:
- [ ] Labels asociados con `htmlFor`
- [ ] Help text con `aria-describedby`
- [ ] Errores con `role="alert"`
- [ ] Required marcado con `aria-required`
- [ ] Invalid marcado con `aria-invalid`

**Modals/Dialogs**:
- [ ] Focus trap activo
- [ ] Escape para cerrar
- [ ] `role="dialog"` y `aria-modal="true"`
- [ ] `aria-labelledby` apunta al título
- [ ] Focus vuelve al trigger al cerrar

**Images**:
- [ ] `alt` descriptivo (no "imagen de...")
- [ ] `alt=""` para decorativas
- [ ] No texto importante solo en imagen

---

## Empty States & Touchpoints

### Empty States = Oportunidades

Los empty states NO son errores. Son momentos de onboarding y conversión.

**Estructura obligatoria**:
```typescript
<EmptyState
  icon={<FolderIcon />}
  title={t('empty.title')}           // "Aún no tienes proyectos"
  description={t('empty.description')} // "Los proyectos te ayudan a..."
  action={{
    label: t('empty.action'),        // "Crear mi primer proyecto"
    onClick: handleCreate
  }}
/>
```

**Principios**:
- Nunca culpar al usuario ("No has creado nada")
- Explicar el beneficio de tomar acción
- CTA claro y específico
- Icono/ilustración amigable (no warning/error)

### Cada Touchpoint = Feedback

**Regla**: Toda acción del usuario debe tener respuesta inmediata.

| Acción | Feedback Esperado |
|--------|-------------------|
| Click en button | Estado visual inmediato (pressed) |
| Submit form | Button disabled + texto "Guardando..." |
| Acción exitosa | Toast de confirmación + siguiente paso |
| Error | Mensaje específico + cómo resolver |
| Hover en interactivo | Cambio visual sutil |
| Focus | Outline claro y consistente |

**Patrón de Toast**:
```typescript
// Usar toast de sonner con aria-live
toast.success(t('success.created'), {
  description: t('success.createdDescription')
});

toast.error(t('errors.generic'), {
  description: t('errors.tryAgain'),
  action: {
    label: t('actions.retry'),
    onClick: handleRetry
  }
});
```

### Loading States

**NO usar**:
- Spinners genéricos sin contexto
- Skeleton loaders que añaden delay percibido
- "Loading..." sin más info

**SÍ usar**:
- Texto específico: "Guardando proyecto..."
- Optimistic UI cuando sea posible
- Progress indicators para operaciones largas

---

## Checklist Pre-Entrega (Completo)

### Funcionalidad
- [ ] ¿Funciona el happy path completo?
- [ ] ¿Los errores muestran mensajes útiles?
- [ ] ¿Hay validación client-side y server-side?

### UX/UI
- [ ] ¿Puede completarse en menos clicks?
- [ ] ¿Está claro qué hacer sin leer instrucciones?
- [ ] ¿Hay feedback inmediato en cada acción?
- [ ] ¿Empty states invitan a tomar acción?
- [ ] ¿Funciona en mobile (touch targets, responsive)?

### i18n & Copy
- [ ] ¿TODOS los textos están en `copies/` co-localizadas?
- [ ] ¿Creaste `/copies/en.json` y `/copies/es.json` en la feature?
- [ ] ¿Copy orientado a beneficio, no función?
- [ ] ¿Help text en campos que lo necesiten?
- [ ] ¿Errores específicos y accionables?

### Accesibilidad
- [ ] ¿Labels asociados a inputs?
- [ ] ¿Errores tienen role="alert" o aria-live?
- [ ] ¿Navegable solo con teclado?
- [ ] ¿Focus visible en elementos interactivos?
- [ ] ¿Animaciones respetan prefers-reduced-motion?

### Performance
- [ ] ¿Carga inicial < 200ms?
- [ ] ¿No hay layout shifts (CLS)?
- [ ] ¿Imágenes optimizadas?

---

## Quick Start

### Comandos de Desarrollo

**Scripts optimizados (para Claude y CI)**:
```bash
npm run dev          # Development server
npm run build        # Production build (output mínimo)
npm run type-check   # TypeScript (sin colores, solo errores)
npm run lint         # ESLint (quiet mode, formato compacto)
npm run test         # Vitest (reporter básico, solo resumen)
```

**Scripts verbose (para debugging manual)**:
```bash
npm run build:verbose      # Build con output completo
npm run type-check:verbose # TypeScript con colores y detalles
npm run lint:verbose       # ESLint con warnings completos
npm run test:verbose       # Vitest con output detallado
```

**Otros comandos útiles**:
```bash
npm run lint:fix     # Auto-fix de ESLint
npm run check        # Pre-commit checks (type-check + lint + test)
npm run pre-push     # Validación completa antes de push
```

**Nota sobre optimización**:
Los comandos por defecto están optimizados para reducir output y consumo de tokens en Claude Code. Usan flags como `--quiet`, `--pretty false`, `--reporter=dot`. Para debugging manual donde necesites ver detalles completos, usa las versiones `:verbose`.

### Claude Code Commands
- `/new-feature [name]` - Crear feature completa
- `/add-page [name]` - Crear página con SEO completo (sitemap, metadata, traducciones)
- `/add-action [name]` - Añadir Server Action
- `/fix-types` - Corregir errores TypeScript
- `/add-translation [keys]` - Añadir traducciones
- `/review-feature [name]` - Revisar feature
- `/audit` - Auto-auditoría completa
- `/security-audit` - Auditoría de seguridad
- `/update-feature-context [name]` - Actualizar CLAUDE.md de feature

---

## Arquitectura: VSA + CQRS

### Estructura Principal

```
src/
├── features/       # Features (VSA + CQRS)
├── shared/         # Utilidades compartidas
├── app/            # Next.js routing
├── i18n/           # Configuración i18n
└── test/           # Test utilities
```

### Estructura de Feature
```
/src/features/[name]/
├── CLAUDE.md             # Contexto específico de la feature
├── components/           # UI específica
├── types/index.ts        # Zod schemas + TS types
├── [name].query.ts       # SELECT operations
├── [name].command.ts     # INSERT/UPDATE/DELETE
├── [name].handler.ts     # Business logic + validation
└── [name].actions.ts     # Server Actions (entry points)
```

### Reglas de Imports
```typescript
// ✅ CORRECTO
import { Button } from '@/shared/components/ui';
import { getUser } from '@/shared/auth';
import { createClientServer } from '@/shared/database/supabase';
import { LoginForm } from '@/features/auth';

// ❌ NUNCA - imports cross-feature
import { something } from '@/features/other-feature';
```

### Validación de Arquitectura
```bash
# ESLint detecta violaciones de arquitectura
npm run lint
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, RSC) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email, magic-link, OAuth) |
| Payments | Stripe (Pricing Table + Webhooks) |
| UI | shadcn/ui + Tailwind + Radix + Magic UI |
| Forms | React Hook Form + Zod |
| i18n | next-intl (en/es) |

### MCP Tools Disponibles

- **Magic UI** (`mcp__magicui__*`): Componentes animados - textos, efectos, decorativos
- **Context7** (`mcp__context7__*`): Documentación actualizada de librerías (Next.js, React, etc.)

---

## Patrones de Código

### Server Action
```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import { handleCreateX } from './x.handler';

export async function createXAction(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const input = {
    name: formData.get('name') as string
  };

  const result = await handleCreateX(user.id, input);

  if (result.success) revalidatePath('/x');
  return result;
}
```

### Handler con Validación
```typescript
import { xSchema, XInput } from './types';
import { createX } from './x.command';

export async function handleCreateX(userId: string, input: XInput) {
  const validation = xSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message
    };
  }
  return createX(userId, validation.data);
}
```

### Query con RLS
```typescript
import { createClientServer } from '@/shared/database/supabase';

export async function getX(userId: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('x')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    data,
    error: error?.message || null
  };
}
```

### Command (Write Operation)
```typescript
import { createClientServer } from '@/shared/database/supabase';
import { XInput } from './types';

export async function createX(userId: string, input: XInput) {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('x')
    .insert({
      user_id: userId,
      ...input
    });

  return {
    success: !error,
    error: error?.message || null
  };
}
```

### Migración SQL
```sql
-- Crear tabla
CREATE TABLE x (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE x ENABLE ROW LEVEL SECURITY;

-- Política para usuarios
CREATE POLICY "Users can manage own x"
  ON x FOR ALL
  USING (auth.uid() = user_id);

-- Política para service role (webhooks)
CREATE POLICY "Service role has full access"
  ON x FOR ALL
  TO service_role
  USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_x_updated_at
  BEFORE UPDATE ON x
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Componente Form
```typescript
'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { createXAction } from '../x.actions';

export function XForm() {
  const t = useTranslations('x');
  const [state, action, pending] = useActionState(createXAction, null);

  useEffect(() => {
    if (state?.success) toast.success(t('created'));
    if (state?.error) toast.error(state.error);
  }, [state, t]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">{t('name')}</Label>
        <Input id="name" name="name" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? t('creating') : t('create')}
      </Button>
    </form>
  );
}
```

---

## Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Schemas | camelCase + Schema | `xSchema` |
| Types | PascalCase | `XInput`, `X` |
| Actions | verb + X + Action | `createXAction` |
| Handlers | handle + Verb + X | `handleCreateX` |
| Queries | get/list + X | `getX`, `listXs` |
| Commands | verb + X | `createX`, `updateX`, `deleteX` |

---

## Features Actuales

| Feature | Descripción | Estado |
|---------|-------------|--------|
| `auth` | Login, register, magic-link, OAuth | ✅ |
| `billing` | Stripe subscriptions | ✅ |
| `dashboard` | Stats del usuario | ✅ |
| `my-account` | Perfil y preferencias | ✅ |
| `admin` | Panel de administración con gestión de usuarios, settings, email journeys | ✅ |
| `home` | Home page admin-ready con arquitectura para A/B testing | ✅ |
| `organizations` | Multi-org support | 🚧 WIP |

---

## Estructura de Directorios

```
/src
├── features/               # Features (VSA + CQRS)
│   ├── auth/               # Autenticación
│   ├── billing/            # Stripe subscriptions
│   ├── dashboard/          # Dashboard de usuario
│   ├── admin/              # Panel de administración
│   ├── home/               # Landing page
│   ├── my-account/         # Perfil de usuario
│   ├── analytics/          # Analytics tracking
│   ├── attribution/        # Attribution tracking
│   └── affiliates/         # Affiliate program
├── shared/
│   ├── auth/               # getUser, requireUser
│   ├── components/ui/      # shadcn/ui
│   ├── config/             # brand.ts
│   ├── database/supabase/  # Supabase clients
│   ├── payments/stripe/    # Stripe integration
│   └── types/              # Tipos compartidos
├── app/                    # Next.js App Router
│   ├── [locale]/
│   │   ├── (app)/          # Rutas protegidas
│   │   ├── (auth)/         # Rutas de auth
│   │   ├── (admin)/        # Rutas de admin
│   │   └── (landing)/      # Rutas públicas
│   └── api/                # API routes
├── i18n/                   # Configuración i18n
└── test/                   # Test utilities
```

---

## Base de Datos

### Tablas Principales
- `profiles` - Datos de usuario (auto-creado via trigger)
- `subscriptions` - Suscripciones Stripe
- `customers` - Clientes Stripe
- `organizations` - Organizaciones
- `attribution_events` - Tracking de conversión

### Reglas
- **Siempre** habilitar RLS
- Foreign key a `auth.users` con `ON DELETE CASCADE`
- Triggers para `updated_at`
- Políticas para `user` y `service_role`

---

## Variables de Entorno

### Requeridas
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=

# App
NEXT_PUBLIC_APP_URL=
```

### Opcionales
```bash
NEXT_PUBLIC_OAUTH_PROVIDERS=google,github
RESEND_API_KEY=
SENTRY_DSN=
```

---

## Testing

```bash
npm run test        # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
```

---

## Admin Panel

### Descripción
Panel de administración completo para gestionar la plataforma SaaS. Permite al owner/admins:
- Ver métricas del negocio (usuarios, suscripciones, MRR)
- Gestionar usuarios y roles de administrador
- Configurar info-bar global (banner de información)
- Controlar email journeys (activar/desactivar)
- Ver productos de cross-sell

### Acceso y Seguridad

**Sistema de Roles**:
- Roles almacenados en `profiles.user_flags` (array de strings)
- Roles disponibles: `'admin'`, `'super_admin'`
- Super admins son también admins para efectos de permisos

**Whitelist de Emails**:
- Variable de entorno: `ADMIN_EMAILS` (emails separados por comas)
- Ejemplo: `ADMIN_EMAILS=admin@example.com,owner@company.com`
- Auto-asignación: usuarios con email en whitelist reciben rol 'admin' automáticamente
- Helper en `/src/shared/lib/admin-whitelist.ts`

**Gestión de Admins desde UI**:
- Ruta: `/admin/users`
- Solo admins pueden promover/degradar otros usuarios
- Seguridad: Un admin NO puede remover sus propios privilegios
- Super admins NO pueden ser degradados desde UI

**Protección de Rutas**:
```typescript
// En server components/actions
import { requireAdmin } from '@/shared/auth';

export default async function AdminPage() {
  const user = await requireAdmin(); // Redirige a /login o /dashboard si no es admin
  // ... código de admin
}
```

### Estructura de Files

```
/src/features/admin/
├── CLAUDE.md                           # Contexto de la feature
├── types/index.ts                      # Zod schemas + TS types
├── admin.query.ts                      # Queries (SELECT)
│   ├── getAllSettings()
│   ├── getSetting<T>()
│   ├── getAdminStats()
│   ├── getAllUsers()
│   └── getUsersWithFilters()
├── admin.command.ts                    # Commands (INSERT/UPDATE/DELETE)
│   ├── updateSetting()
│   ├── toggleEmailJourney()
│   ├── addUserFlag()
│   └── removeUserFlag()
├── admin.handler.ts                    # Business logic + validation
├── admin.actions.ts                    # Server Actions
│   ├── makeUserAdminAction()
│   └── removeUserAdminAction()
└── components/
    ├── admin-layout.tsx                # Layout con sidebar
    ├── stats-dashboard.tsx             # Métricas del negocio
    ├── info-bar-settings.tsx           # Config de info-bar
    ├── email-journeys-control.tsx      # Control de email journeys
    ├── cross-sell-panel.tsx            # Panel de cross-sell
    ├── user-list.tsx                   # Lista de usuarios con filtros
    └── user-role-badge.tsx             # Badge de rol (Admin/User)

/src/app/[locale]/(admin)/admin/
├── layout.tsx                          # requireAdmin() + AdminLayout
├── page.tsx                            # Dashboard (stats + cross-sell)
├── users/page.tsx                      # Gestión de usuarios
├── emails/page.tsx                     # Email journeys
└── settings/page.tsx                   # Info-bar settings

/src/shared/
├── auth/roles.ts                       # hasRole, isAdmin, requireAdmin, syncAdminRoleFromWhitelist
├── lib/admin-whitelist.ts              # isEmailWhitelisted, getWhitelistedEmails
└── components/
    ├── info-bar.tsx                    # Server component (fetch settings)
    └── info-bar-client.tsx             # Client component (dismiss logic)
```

### Base de Datos

**Tabla: app_settings**
```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('info_bar', 'email', 'features', 'cross_sell', 'general')
  ),
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies**:
- Admins: acceso completo (SELECT, INSERT, UPDATE, DELETE)
- Public: solo lectura de `info_bar` (necesario para mostrar en páginas no autenticadas)

**Settings Disponibles**:
- `info_bar`: InfoBarSettings (enabled, mode, scope, messages, dismissible)
- `email_journeys`: EmailJourneysSettings (objeto con journeys y sus estados)
- `feature_flags`: FeatureFlags (flags de features experimentales)
- `cross_sell_products`: CrossSellProductsSettings (productos para cross-sell)

### Flujos Principales

**1. Auto-asignación de Admin al Registro**:
```typescript
// En callback de Supabase Auth
const user = await getUser();
if (user?.email) {
  await syncAdminRoleFromWhitelist(user.id, user.email);
}
```

**2. Promover Usuario a Admin**:
```typescript
// Desde /admin/users
await makeUserAdminAction(userId);
// → Valida permisos → addUserFlag('admin') → Revalidate path
```

**3. Configurar Info-Bar**:
```typescript
// Desde /admin/settings
await updateInfoBarAction({
  enabled: true,
  mode: 'info',
  scope: 'all',
  messages: { en: '...', es: '...' },
  dismissible: true
});
// → Valida con Zod → updateInfoBarSettings() → Revalidate all pages
```

### Testing Checklist

- [ ] Email en whitelist recibe admin al registrarse
- [ ] Email NO en whitelist NO recibe admin
- [ ] Admin puede promover otros usuarios
- [ ] Admin NO puede remover sus propios privilegios
- [ ] Super admin NO puede ser degradado
- [ ] Info-bar se muestra según scope (all/authenticated/unauthenticated)
- [ ] Info-bar puede ser dismissed (localStorage)
- [ ] Email journey toggle actualiza correctamente
- [ ] Stats dashboard muestra métricas correctas

### Troubleshooting

**"No puedo acceder a /admin"**:
1. Verifica que tu email está en `ADMIN_EMAILS`
2. Logout y login de nuevo (para ejecutar syncAdminRoleFromWhitelist)
3. Verifica en Supabase que `profiles.user_flags` contiene `['admin']`

**"Auto-asignación no funciona"**:
- Verifica que `ADMIN_EMAILS` está definida correctamente (sin espacios extra)
- Verifica que el callback de auth está llamando a `syncAdminRoleFromWhitelist()`

**"No puedo promover usuarios"**:
- Solo admins pueden promover
- Verifica que el usuario a promover existe
- Check browser console para errores de Server Action

---

## Scripts Directory

⚠️ **Estado Actual**: Estructura legacy con deuda técnica documentada.

### Documentación

📖 **Análisis Completo**: Ver `scripts/ARCHITECTURE.md` para:
- Análisis de escalabilidad
- Problemas identificados
- Plan de refactorización (3 fases)
- Decision record

📖 **Guía Rápida**: Ver `scripts/README.md` para:
- Uso de cada script
- Convenciones de naming
- Cómo añadir nuevos scripts

### Reglas Mientras Tanto

Para **evitar empeorar** la situación actual:

**DO** ✅:
- Añadir pasos de setup a `scripts/setup-script/categories/`
- Usar naming `verb-noun.mjs` (ej: `generate-feature.mjs`)
- Poner generators en `scripts/generators/` organizados
- Documentar scripts complejos

**DON'T** ❌:
- Añadir más archivos en `scripts/` root
- Modificar `setup.mjs` legacy (usar `setup-script/` en su lugar)
- Crear patterns de naming inconsistentes
- Mezclar responsabilidades en un solo archivo

### Sistema de Setup

**Usar el nuevo sistema modular**:
```bash
npm run setup          # Setup interactivo con menús
npm run setup:verify   # Verificar progreso
npm run setup:resume   # Resumir setup pausado
```

**NO usar**:
- `setup.mjs` legacy (deprecated)
- Scripts granulares directos (`setup-db.mjs`, `setup-seo.mjs`, etc.)

### Estado: Grade C+ (60/100)

**Próximo review**: Q1 2026 o cuando se añadan 5+ scripts nuevos

**Criterios para refactor**:
- [ ] Setup system estable
- [ ] Paths corregidos
- [ ] Sin bugs críticos
- [ ] Tiempo dedicado disponible (1-2 semanas)

---

## Testing Strategy

### Filosofía: Tests Pragmáticos

**NO testear por testear**. Solo añade tests donde aporten valor real.

### Estructura de Tests

```
/src/features/[name]/
├── __tests__/
│   ├── README.md                    # 📖 Guía de testing + templates
│   ├── [name].handler.test.ts.example  # Template listo para usar
│   └── [name].handler.test.ts       # Tests reales (cuando aplique)
```

**Cada feature incluye**:
- `__tests__/README.md` - Guía específica con templates copy-paste
- `.test.ts.example` - Ejemplo funcional listo para renombrar
- Checklist en `CLAUDE.md` de la feature

### ¿Cuándo Añadir Tests Unitarios?

**SÍ testear** ✅:
- Lógica de negocio compleja (cálculos, algoritmos, reglas)
- Validaciones más allá de `required` (patrones, rangos, dependencias)
- Transformaciones de datos no triviales
- Edge cases críticos (división por cero, overflow, formatos)
- Utils compartidos en `/shared/lib/` (usados por múltiples features)
- Código crítico (pagos, permisos, operaciones financieras)

**NO testear** ❌:
- CRUD simple que solo usa schema.safeParse() + DB call
- Handlers que solo delegan a commands sin lógica adicional
- Queries/Commands básicos (SELECT/INSERT sin transformaciones)
- Componentes que solo renderizan UI estándar
- Código ya cubierto por RLS en DB + E2E

### ¿Cuándo Añadir Tests E2E?

**Obligatorio para flujos críticos**:
- Registro y autenticación
- Pago y suscripciones
- Onboarding de usuario
- Operaciones que afectan datos de otros usuarios
- Flujos multi-step importantes

**Opcional para features secundarias**:
- CRUD simple bien cubierto por RLS
- Features internas solo para admins
- Páginas estáticas o de contenido

### Tipos de Tests

| Tipo | Ubicación | Cuándo |
|------|-----------|--------|
| **Unit** | `features/[name]/__tests__/` | Lógica compleja, cálculos, validaciones custom |
| **Integration** | `features/[name]/__tests__/` | Flujos que tocan múltiples layers (handler → command → DB) |
| **Component** | `features/[name]/__tests__/components/` | Componentes con lógica (no solo UI) |
| **E2E** | `/tests/e2e/` | Flujos críticos de usuario completos |

### Meta-Tests (Shared Code)

Tests para código compartido en `/shared/`:

```
/src/shared/
├── auth/
│   ├── __tests__/
│   │   └── roles.test.ts         # Testear isAdmin, hasRole, etc.
├── lib/
│   ├── __tests__/
│   │   └── validation.test.ts    # Utils de validación compartidos
└── database/
    └── __tests__/
        └── supabase.test.ts      # Setup de clientes Supabase
```

**Obligatorio testear**:
- Funciones usadas por 3+ features
- Lógica de autorización/permisos
- Helpers de validación custom
- Transformaciones de datos compartidas

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Feature específica
npm run test -- features/auth

# Watch mode (desarrollo)
npm run test -- features/billing --watch

# Coverage
npm run test -- --coverage

# E2E
npm run test:e2e
npm run test:e2e -- auth  # Solo tests de auth
```

### Configuración Vitest

Ver `vitest.config.ts` para:
- Setup de testing library
- Mocks de next-intl, Supabase
- Coverage config
- Path aliases (@/*)

### Workflow Recomendado

1. **Al crear feature nueva**:
   - Revisa `__tests__/README.md` generado
   - Marca en `CLAUDE.md` si necesita "Solo E2E" o "Unit + E2E"
   - Si no estás seguro → marca "TBD" y decide después de implementar

2. **Durante desarrollo**:
   - Si encuentras lógica compleja → renombra `.example` y añade tests
   - Si es CRUD simple → skip unit tests, añade E2E básico

3. **Antes de merge/deploy**:
   - Verifica E2E de flujos críticos pasan
   - Si hay tests unitarios, que pasen
   - Coverage NO es objetivo (calidad > cantidad)

### Ejemplo: Decisión de Testing

**Feature: User Settings** (CRUD simple)
```markdown
## Testing
- [x] Solo E2E - Feature simple CRUD sin lógica compleja
- [ ] Unit + E2E
```
👉 Solo crear `/tests/e2e/user-settings.spec.ts`

**Feature: Billing Proration** (cálculos complejos)
```markdown
## Testing
- [ ] Solo E2E
- [x] Unit + E2E - Hay lógica de negocio/cálculos que testear
```
👉 Crear tests en `features/billing/__tests__/proration.test.ts` + E2E

---

## Comandos Útiles

```bash
# Generar nueva feature (completa con CRUD, migración, component, traducciones)
npm run generate:slice

# Aplicar migraciones
npx supabase db push

# Generar tipos TypeScript desde Supabase
npm run gen:types

# Añadir componente shadcn
npx shadcn@latest add [componente]

# Type check manual (se ejecuta automáticamente post-edit)
npm run type-check
```

---

## Workflow Optimizado

### Crear nueva feature
```bash
npm run generate:slice    # Genera todo: código, migración, CLAUDE.md, traducciones
npx supabase db push      # Aplica migración
npm run gen:types         # Actualiza tipos de Supabase
```

### Validación automática
- Hook post-edit ejecuta `type-check` automáticamente en archivos .ts/.tsx
- Errores de tipos se muestran inmediatamente después de cada edición
- No necesitas ejecutar type-check manualmente
