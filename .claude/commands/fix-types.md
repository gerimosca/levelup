Ejecuta type-check y corrige todos los errores de TypeScript encontrados.

## Proceso:

### 1. Ejecutar type-check
```bash
npm run type-check
```

### 2. Analizar errores
Categorizar por tipo:
- Imports rotos
- Tipos incorrectos
- Any implícitos
- Props faltantes
- Incompatibilidades de tipos

### 3. Prioridad de corrección

**Alta prioridad:**
1. Imports rotos (módulos no encontrados)
2. Tipos null/undefined no manejados
3. Props requeridas faltantes

**Media prioridad:**
4. Tipos incorrectos en funciones
5. Incompatibilidades de arrays/objects
6. Generics mal tipados

**Baja prioridad:**
7. Any implícitos
8. Unused variables (prefijo con _)

### 4. Patrones comunes de fix

**Import roto:**
```typescript
// Verificar path correcto
import { X } from '@/shared/...';
```

**Null check:**
```typescript
// Antes
const x = data.value;

// Después
const x = data?.value ?? defaultValue;
```

**FormData typing:**
```typescript
const value = formData.get('field') as string;
```

**Optional props:**
```typescript
interface Props {
  required: string;
  optional?: string;
}
```

### 5. Re-ejecutar hasta 0 errores
```bash
npm run type-check
```

### 6. Verificar lint también
```bash
npm run lint
```

## No hacer:
- No usar `@ts-ignore` o `@ts-expect-error`
- No usar `any` explícito sin justificación
- No silenciar errores, corregirlos
