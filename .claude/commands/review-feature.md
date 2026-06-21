Revisa la feature "$ARGUMENTS" verificando que cumple todos los estándares del proyecto.

## Checklist de Revisión

### 1. Estructura de Archivos
- [ ] Tiene `types/index.ts` con schemas Zod
- [ ] Tiene `[feature].query.ts` para lecturas
- [ ] Tiene `[feature].command.ts` para escrituras
- [ ] Tiene `[feature].handler.ts` con lógica de negocio
- [ ] Tiene `[feature].actions.ts` con Server Actions
- [ ] Tiene `components/` con UI
- [ ] Tiene `index.ts` exportando públicamente

### 2. Imports
- [ ] Solo importa de `@/shared/*`
- [ ] NO hay imports de otras features
- [ ] Imports organizados (externos, internos, types)

### 3. Types
- [ ] Schemas Zod con validaciones apropiadas
- [ ] Types inferidos de schemas
- [ ] Exportaciones limpias en index.ts
- [ ] No hay `any` sin justificación

### 4. Queries
- [ ] Usan `createClientServer()`
- [ ] Retornan `{ data, error }`
- [ ] Filtran por `user_id` cuando aplica
- [ ] Manejan errores correctamente

### 5. Commands
- [ ] Usan `createClientServer()`
- [ ] Retornan `{ success, error }`
- [ ] Operaciones atómicas
- [ ] No contienen lógica de negocio

### 6. Handlers
- [ ] Validan input con Zod schema
- [ ] Retornan error descriptivo si validación falla
- [ ] Llaman a queries/commands apropiados
- [ ] Contienen lógica de negocio

### 7. Actions
- [ ] Tienen `'use server'` al inicio
- [ ] Verifican autenticación con `getUser()`
- [ ] Extraen datos de FormData correctamente
- [ ] Llaman handlers, no queries/commands directamente
- [ ] Usan `revalidatePath()` cuando modifican datos
- [ ] Retornan `{ success, error }` consistentemente

### 8. Componentes
- [ ] Client components tienen `'use client'`
- [ ] Usan `useActionState` para forms
- [ ] Usan `useTranslations` para textos
- [ ] Muestran feedback con `toast`
- [ ] Manejan estado `pending`
- [ ] Usan shadcn/ui components

### 9. Base de Datos
- [ ] Tabla tiene RLS habilitado
- [ ] Tiene política para usuarios autenticados
- [ ] Tiene política para service_role
- [ ] Foreign keys con CASCADE
- [ ] Trigger para updated_at

### 10. Traducciones
- [ ] Namespace en messages/en.json
- [ ] Namespace en messages/es.json
- [ ] Mismas keys en ambos idiomas
- [ ] Textos descriptivos y correctos

### 11. Testing
- [ ] type-check pasa sin errores
- [ ] lint pasa sin errores
- [ ] Feature funciona en desarrollo

## Acciones

### Si encuentra problemas:
1. Listar todos los issues encontrados
2. Priorizar por severidad
3. Corregir en orden de prioridad
4. Re-verificar después de correcciones

### Severidad:
- **Crítico**: Errores de seguridad, RLS faltante, imports cross-feature
- **Alto**: Type errors, lógica en lugares incorrectos
- **Medio**: Traducciones faltantes, inconsistencias
- **Bajo**: Code style, optimizaciones
