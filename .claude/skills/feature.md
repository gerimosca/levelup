# Skill: Crear Feature Completa

Guía para crear una nueva feature siguiendo VSA + CQRS.

## Estructura Final

```
/src/features/[nombre]/
├── CLAUDE.md                # Contexto específico para Claude
├── components/
│   └── [nombre]-form.tsx
├── types/
│   └── index.ts
├── [nombre].query.ts
├── [nombre].command.ts
├── [nombre].handler.ts
├── [nombre].actions.ts
└── index.ts
```

## Paso 1: Generar Estructura Base

```bash
npm run generate:slice [nombre]
```

## Paso 2: Definir Types

**`types/index.ts`**
```typescript
import { z } from 'zod';

// Schema de creación
export const create[Nombre]Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type Create[Nombre]Input = z.infer<typeof create[Nombre]Schema>;

// Schema de actualización
export const update[Nombre]Schema = create[Nombre]Schema.partial();
export type Update[Nombre]Input = z.infer<typeof update[Nombre]Schema>;

// Type de entidad
export interface [Nombre] {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
```

## Paso 3: Crear Query

**`[nombre].query.ts`**
```typescript
import { createClientServer } from '@/shared/database/supabase';

export async function get[Nombre](userId: string, id: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('[nombre]s')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .single();

  return {
    data,
    error: error?.message || null
  };
}

export async function list[Nombre]s(userId: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('[nombre]s')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return {
    data: data || [],
    error: error?.message || null
  };
}
```

## Paso 4: Crear Command

**`[nombre].command.ts`**
```typescript
import { createClientServer } from '@/shared/database/supabase';
import { Create[Nombre]Input, Update[Nombre]Input } from './types';

export async function create[Nombre](userId: string, input: Create[Nombre]Input) {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('[nombre]s')
    .insert({
      user_id: userId,
      ...input
    });

  return {
    success: !error,
    error: error?.message || null
  };
}

export async function update[Nombre](userId: string, id: string, input: Update[Nombre]Input) {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('[nombre]s')
    .update(input)
    .eq('user_id', userId)
    .eq('id', id);

  return {
    success: !error,
    error: error?.message || null
  };
}

export async function delete[Nombre](userId: string, id: string) {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('[nombre]s')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);

  return {
    success: !error,
    error: error?.message || null
  };
}
```

## Paso 5: Crear Handler

**`[nombre].handler.ts`**
```typescript
import {
  create[Nombre]Schema,
  update[Nombre]Schema,
  Create[Nombre]Input,
  Update[Nombre]Input
} from './types';
import { create[Nombre], update[Nombre], delete[Nombre] } from './[nombre].command';

export async function handleCreate[Nombre](userId: string, input: Create[Nombre]Input) {
  const validation = create[Nombre]Schema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message
    };
  }
  return create[Nombre](userId, validation.data);
}

export async function handleUpdate[Nombre](
  userId: string,
  id: string,
  input: Update[Nombre]Input
) {
  const validation = update[Nombre]Schema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message
    };
  }
  return update[Nombre](userId, id, validation.data);
}

export async function handleDelete[Nombre](userId: string, id: string) {
  return delete[Nombre](userId, id);
}
```

## Paso 6: Crear Actions

**`[nombre].actions.ts`**
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import {
  handleCreate[Nombre],
  handleUpdate[Nombre],
  handleDelete[Nombre]
} from './[nombre].handler';

export async function create[Nombre]Action(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const input = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
  };

  const result = await handleCreate[Nombre](user.id, input);

  if (result.success) {
    revalidatePath('/[nombre]s');
  }

  return result;
}

export async function update[Nombre]Action(
  prevState: any,
  formData: FormData
) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const id = formData.get('id') as string;
  const input = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || undefined,
  };

  const result = await handleUpdate[Nombre](user.id, id, input);

  if (result.success) {
    revalidatePath('/[nombre]s');
  }

  return result;
}

export async function delete[Nombre]Action(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const id = formData.get('id') as string;
  const result = await handleDelete[Nombre](user.id, id);

  if (result.success) {
    revalidatePath('/[nombre]s');
  }

  return result;
}
```

## Paso 7: Crear Migración

```bash
npx supabase migration new [nombre]s
```

```sql
CREATE TABLE [nombre]s (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE [nombre]s ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own [nombre]s"
  ON [nombre]s FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access"
  ON [nombre]s FOR ALL
  TO service_role
  USING (true);

CREATE TRIGGER update_[nombre]s_updated_at
  BEFORE UPDATE ON [nombre]s
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Paso 8: Añadir Traducciones

Ver skill `add-translation` o command `/add-translation`.

## Paso 9: Crear CLAUDE.md de la Feature

Crear `/src/features/[nombre]/CLAUDE.md`:

```markdown
# Feature: [Nombre]

## Propósito
[Descripción breve de qué hace esta feature y por qué existe]

## Decisiones de Arquitectura
- [Decisión 1]: [Razón]

## Dependencias
- **Tables**: [nombre]s
- **APIs externas**: [ninguna / lista]

## Testing

### Casos críticos
- [ ] Usuario puede crear [nombre]
- [ ] Usuario puede editar [nombre]
- [ ] Usuario puede eliminar [nombre]
- [ ] Validaciones funcionan correctamente

### Ejecutar tests
\`\`\`bash
npm run test -- features/[nombre]
\`\`\`

## Deuda Técnica
[Ninguna conocida]

## Notas
[Contexto adicional importante para trabajar en esta feature]
```
