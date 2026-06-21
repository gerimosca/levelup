Crea una nueva feature llamada "$ARGUMENTS" siguiendo el patrón VSA + CQRS completo.

## Pasos a ejecutar:

### 1. Generar estructura base
```bash
npm run generate:slice $ARGUMENTS
```

### 2. Crear migración SQL
Si la feature necesita persistencia:
```bash
npx supabase migration new $ARGUMENTS
```

Incluir en la migración:
- CREATE TABLE con id UUID
- Foreign key a auth.users con CASCADE
- Campos created_at/updated_at
- RLS habilitado
- Políticas para user y service_role
- Trigger para updated_at

### 3. Definir tipos en `types/index.ts`
- Schema Zod con validaciones
- Type inferido del schema
- Types adicionales si necesario

### 4. Implementar archivos CQRS

**query.ts** - Operaciones de lectura:
- getX(userId)
- listXs(userId)

**command.ts** - Operaciones de escritura:
- createX(userId, input)
- updateX(userId, id, input)
- deleteX(userId, id)

**handler.ts** - Lógica de negocio:
- handleCreateX con validación Zod
- handleUpdateX con validación
- handleDeleteX

**actions.ts** - Server Actions:
- createXAction con getUser()
- updateXAction con getUser()
- deleteXAction con getUser()
- Incluir revalidatePath

### 5. Crear componentes
En `components/`:
- Form principal con useActionState y FieldWrapper (accesibilidad incluida)
- EmptyState para estados vacíos (invitar a acción)
- List/Table si aplica
- Usar shadcn/ui components

Usar los nuevos componentes accesibles:
```typescript
import { FieldWrapper, TextareaField } from '@/shared/components/ui/field-wrapper';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { FormFeedback } from '@/shared/components/ui/form-feedback';
```

### 6. Añadir traducciones
En `messages/en.json` y `messages/es.json`:
- Namespace: "$ARGUMENTS"
- **NUNCA hardcodear textos** - todo en i18n

Estructura obligatoria (ver template en messages):
```typescript
{
  "page": { "title", "description" },
  "form": {
    "fieldName": {
      "label": "Orientado a beneficio",
      "placeholder": "Ejemplo concreto",
      "help": "Contexto útil",
      "errors": { "required", "invalid" }
    }
  },
  "empty": { "title", "description", "action" },
  "success": { "created", "createdDescription" },
  "errors": { "notFound", "unauthorized" },
  "actions": { "create", "creating", "update", "delete" }
}
```

### 7. Crear página
En `src/app/[locale]/(app)/$ARGUMENTS/page.tsx`:
- Server Component
- Fetch inicial de datos
- Render de componentes

### 8. Crear CLAUDE.md de la feature
En `/src/features/$ARGUMENTS/CLAUDE.md`:
- Propósito de la feature
- Decisiones de arquitectura
- Dependencias (tables, APIs)
- Casos de testing críticos
- Deuda técnica conocida

### 9. Decisiones de visibilidad

**IMPORTANTE**: Preguntar al usuario antes de continuar:

#### Pregunta 1: Landing SEO
> ¿Esta feature es pública y beneficia de tráfico SEO? [Y/n]

**Si responde Y (sí)**:
- Seguir skill `seo-landing`
- Crear página en `(landing)/features/$ARGUMENTS/`
- Investigar keywords relevantes
- Añadir traducciones SEO en ambos idiomas
- Crear OG image

**Si responde N (no)**:
- Documentar en CLAUDE.md por qué no aplica (ej: "Feature interna", "No aporta SEO")

#### Pregunta 2: Home page
> ¿Mostrar esta feature en la sección de features de la home? [Y/n]

**Si responde Y (sí)**:
- Añadir entrada en `src/app/[locale]/(landing)/landing-features.tsx`
- Elegir icono de lucide-react apropiado
- Añadir traducciones en `landing.features.$ARGUMENTS` (en/es)
- Elegir color de gradiente que no repita

**Si responde N (no)**:
- Documentar en CLAUDE.md por qué no aplica

## Checklist final

### Arquitectura
- [ ] No hay imports cross-feature
- [ ] RLS habilitado en tabla
- [ ] Types exportados en index.ts
- [ ] npm run type-check pasa

### UX/UI
- [ ] Empty states invitan a tomar acción
- [ ] Feedback inmediato en cada acción (toast)
- [ ] Funciona en mobile (touch targets 44px)

### i18n & Copy
- [ ] TODOS los textos en messages/*.json (nunca hardcoded)
- [ ] Traducciones en ambos idiomas (en/es)
- [ ] Copy orientado a beneficio
- [ ] Help text en campos de formulario
- [ ] Errores específicos y accionables

### Accesibilidad
- [ ] Labels asociados a inputs (FieldWrapper)
- [ ] Errores con role="alert" (FormFeedback)
- [ ] Navegable solo con teclado
- [ ] Focus visible en elementos interactivos

### Documentación
- [ ] CLAUDE.md creado con propósito y checklist

### Visibilidad
- [ ] Decisión SEO tomada y documentada
- [ ] Si aplica: Landing SEO creada con skill `seo-landing`
- [ ] Decisión home page tomada y documentada
- [ ] Si aplica: Feature añadida a landing-features.tsx con traducciones
