#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toPascalCase(str) {
  return capitalize(toCamelCase(str));
}

function toSnakeCase(str) {
  return str.replace(/-/g, '_');
}

async function main() {
  console.log('\n🚀 VSA Slice Generator (Enhanced)\n');

  const name = await question('Slice name (kebab-case, e.g., "user-settings"): ');

  if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error('❌ Invalid name. Use kebab-case (e.g., "user-settings")');
    process.exit(1);
  }

  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const snakeName = toSnakeCase(name);
  const tableName = `${snakeName}s`;
  const basePath = path.join(process.cwd(), 'src', 'features', name);

  // Check if slice already exists
  if (fs.existsSync(basePath)) {
    console.error(`❌ Slice "${name}" already exists at ${basePath}`);
    process.exit(1);
  }

  // Create directories
  const directories = [
    basePath,
    path.join(basePath, 'components'),
    path.join(basePath, 'types'),
    path.join(basePath, '__tests__'),
  ];

  directories.forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });

  // Create files
  const files = [
    // Types
    {
      path: path.join(basePath, 'types', 'index.ts'),
      content: `import { z } from 'zod';

export const create${pascalName}Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type Create${pascalName}Input = z.infer<typeof create${pascalName}Schema>;

export const update${pascalName}Schema = create${pascalName}Schema.partial();

export type Update${pascalName}Input = z.infer<typeof update${pascalName}Schema>;

export type ${pascalName} = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};
`,
    },
    // Query
    {
      path: path.join(basePath, `${name}.query.ts`),
      content: `import { createClientServer } from '@/shared/database/supabase';
import type { ${pascalName} } from './types';

export async function get${pascalName}(userId: string, id: string): Promise<{
  data: ${pascalName} | null;
  error: string | null;
}> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('${tableName}')
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .single();

  return {
    data,
    error: error?.message || null,
  };
}

export async function list${pascalName}s(userId: string): Promise<{
  data: ${pascalName}[];
  error: string | null;
}> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('${tableName}')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return {
    data: data || [],
    error: error?.message || null,
  };
}
`,
    },
    // Command
    {
      path: path.join(basePath, `${name}.command.ts`),
      content: `import { createClientServer } from '@/shared/database/supabase';
import type { Create${pascalName}Input, Update${pascalName}Input } from './types';

export async function create${pascalName}(
  userId: string,
  input: Create${pascalName}Input
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('${tableName}')
    .insert({
      user_id: userId,
      ...input,
    });

  return {
    success: !error,
    error: error?.message || null,
  };
}

export async function update${pascalName}(
  userId: string,
  id: string,
  input: Update${pascalName}Input
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('${tableName}')
    .update(input)
    .eq('user_id', userId)
    .eq('id', id);

  return {
    success: !error,
    error: error?.message || null,
  };
}

export async function delete${pascalName}(
  userId: string,
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('${tableName}')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);

  return {
    success: !error,
    error: error?.message || null,
  };
}
`,
    },
    // Handler
    {
      path: path.join(basePath, `${name}.handler.ts`),
      content: `import { list${pascalName}s, get${pascalName} } from './${name}.query';
import { create${pascalName}, update${pascalName}, delete${pascalName} } from './${name}.command';
import { create${pascalName}Schema, update${pascalName}Schema, type Create${pascalName}Input, type Update${pascalName}Input } from './types';

export async function handleList${pascalName}s(userId: string) {
  return list${pascalName}s(userId);
}

export async function handleGet${pascalName}(userId: string, id: string) {
  return get${pascalName}(userId, id);
}

export async function handleCreate${pascalName}(userId: string, input: Create${pascalName}Input) {
  const validation = create${pascalName}Schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  return create${pascalName}(userId, validation.data);
}

export async function handleUpdate${pascalName}(userId: string, id: string, input: Update${pascalName}Input) {
  const validation = update${pascalName}Schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  return update${pascalName}(userId, id, validation.data);
}

export async function handleDelete${pascalName}(userId: string, id: string) {
  return delete${pascalName}(userId, id);
}
`,
    },
    // Actions
    {
      path: path.join(basePath, `${name}.actions.ts`),
      content: `'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import {
  handleList${pascalName}s,
  handleGet${pascalName},
  handleCreate${pascalName},
  handleUpdate${pascalName},
  handleDelete${pascalName},
} from './${name}.handler';

export async function list${pascalName}sAction() {
  const user = await getUser();
  if (!user) return { data: [], error: 'Not authenticated' };

  return handleList${pascalName}s(user.id);
}

export async function get${pascalName}Action(id: string) {
  const user = await getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  return handleGet${pascalName}(user.id, id);
}

export async function create${pascalName}Action(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const input = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
  };

  const result = await handleCreate${pascalName}(user.id, input);

  if (result.success) {
    revalidatePath('/${name}');
  }

  return result;
}

export async function update${pascalName}Action(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const id = formData.get('id') as string;
  const input = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || undefined,
  };

  const result = await handleUpdate${pascalName}(user.id, id, input);

  if (result.success) {
    revalidatePath('/${name}');
  }

  return result;
}

export async function delete${pascalName}Action(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const id = formData.get('id') as string;
  const result = await handleDelete${pascalName}(user.id, id);

  if (result.success) {
    revalidatePath('/${name}');
  }

  return result;
}
`,
    },
    // Component - Form with accessibility
    {
      path: path.join(basePath, 'components', `${name}-form.tsx`),
      content: `'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { FieldWrapper, TextareaField } from '@/shared/components/ui/field-wrapper';
import { FormFeedback } from '@/shared/components/ui/form-feedback';
import { create${pascalName}Action } from '../${name}.actions';

export function ${pascalName}Form() {
  const t = useTranslations('${camelName}');
  const [state, action, pending] = useActionState(create${pascalName}Action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t('success.created'), {
        description: t('success.createdDescription'),
      });
    }
  }, [state, t]);

  return (
    <form action={action} className="space-y-6">
      <FieldWrapper
        id="title"
        name="title"
        label={t('form.title.label')}
        placeholder={t('form.title.placeholder')}
        help={t('form.title.help')}
        error={state?.fieldErrors?.title}
        required
      />

      <TextareaField
        id="description"
        name="description"
        label={t('form.description.label')}
        placeholder={t('form.description.placeholder')}
        help={t('form.description.help')}
        error={state?.fieldErrors?.description}
        rows={4}
      />

      {state?.error && (
        <FormFeedback message={state.error} variant="error" />
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? t('actions.creating') : t('actions.create')}
      </Button>
    </form>
  );
}
`,
    },
    // Component - Empty State
    {
      path: path.join(basePath, 'components', `${name}-empty.tsx`),
      content: `'use client';

import { useTranslations } from 'next-intl';
import { FolderOpen } from 'lucide-react';
import { EmptyState } from '@/shared/components/ui/empty-state';

interface ${pascalName}EmptyProps {
  onCreateClick: () => void;
}

export function ${pascalName}Empty({ onCreateClick }: ${pascalName}EmptyProps) {
  const t = useTranslations('${camelName}');

  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title={t('empty.title')}
      description={t('empty.description')}
      action={{
        label: t('empty.action'),
        onClick: onCreateClick,
      }}
    />
  );
}
`,
    },
    // Components index
    {
      path: path.join(basePath, 'components', 'index.ts'),
      content: `export { ${pascalName}Form } from './${name}-form';
export { ${pascalName}Empty } from './${name}-empty';
`,
    },
    // Barrel export
    {
      path: path.join(basePath, 'index.ts'),
      content: `export * from './components';
export * from './${name}.actions';
export * from './${name}.handler';
export * from './${name}.query';
export * from './${name}.command';
export * from './types';
`,
    },
    // Test README
    {
      path: path.join(basePath, '__tests__', 'README.md'),
      content: `# Testing Guide: ${pascalName}

## ¿Qué testear en esta feature?

**ANTES de escribir tests, pregúntate**:
- ¿Esta feature tiene lógica de negocio compleja? (cálculos, algoritmos, reglas)
- ¿Los errores aquí son críticos para el negocio? (pagos, permisos, datos sensibles)
- ¿Esta lógica se usa en múltiples lugares?

**Si respondiste NO a todo** → Probablemente no necesitas tests unitarios. Un E2E básico es suficiente.

---

## Template: Test Básico de Handler

\`\`\`typescript
// ${name}.handler.test.ts
import { describe, it, expect } from 'vitest';
import { handleCreate${pascalName} } from '../${name}.handler';

describe('${pascalName} Handler', () => {
  describe('handleCreate${pascalName}', () => {
    it('should validate required fields', async () => {
      const result = await handleCreate${pascalName}('user-id', {
        title: '', // Invalid: empty
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept valid input', async () => {
      const result = await handleCreate${pascalName}('user-id', {
        title: 'Valid Title',
        description: 'Optional description',
      });

      // Mock DB call si es necesario
      expect(result.success).toBe(true);
    });
  });
});
\`\`\`

---

## Template: Test de Componente

\`\`\`typescript
// components/${name}-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ${pascalName}Form } from '../components/${name}-form';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('${pascalName}Form', () => {
  it('should show validation errors on empty submit', async () => {
    render(<${pascalName}Form />);

    const submitBtn = screen.getByRole('button');
    fireEvent.click(submitBtn);

    // Espera mensajes de validación del browser (required attribute)
    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toBeRequired();
  });

  it('should disable submit button while pending', async () => {
    render(<${pascalName}Form />);

    const submitBtn = screen.getByRole('button');

    // Simula pending state (requiere mock de useActionState)
    // expect(submitBtn).toBeDisabled();
  });
});
\`\`\`

---

## ¿Cuándo añadir tests reales?

### ✅ SÍ testear:
- Validaciones complejas (más allá de "required")
- Cálculos matemáticos o de negocio
- Transformaciones de datos no triviales
- Edge cases críticos (división por cero, valores negativos, etc.)
- Funciones helper reutilizadas

### ❌ NO testear (no vale la pena):
- CRUD básico (ya cubierto por RLS + E2E)
- Handlers que solo llaman a \`schema.safeParse()\`
- Componentes que solo renderizan UI estándar
- Queries/Commands sin lógica adicional

---

## Ejecutar Tests

\`\`\`bash
# Todos los tests de esta feature
npm run test -- ${name}

# Watch mode durante desarrollo
npm run test -- ${name} --watch

# Con coverage
npm run test -- ${name} --coverage
\`\`\`

---

## Next Steps

1. **Si la feature es simple CRUD**: Considera solo E2E en \`/tests/e2e/${name}.spec.ts\`
2. **Si hay lógica compleja**: Usa los templates arriba como punto de partida
3. **Si encuentras bugs recurrentes**: Añade test de regresión para ese caso específico

**Recuerda**: Código sin tests != malo. Tests sin valor != bueno. Testea lo que importa.
`,
    },
    // Test example (commented, ready to uncomment)
    {
      path: path.join(basePath, '__tests__', `${name}.handler.test.ts.example`),
      content: `import { describe, it, expect } from 'vitest';
import { handleCreate${pascalName} } from '../${name}.handler';

describe('${pascalName} Handler', () => {
  describe('handleCreate${pascalName}', () => {
    it('should validate required fields', async () => {
      const result = await handleCreate${pascalName}('user-id', {
        title: '', // Invalid: empty
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept valid input', async () => {
      const result = await handleCreate${pascalName}('user-id', {
        title: 'Valid Title',
        description: 'Optional description',
      });

      // TODO: Mock DB call if needed
      // For now, this will actually try to insert to DB
      expect(result.success).toBe(true);
    });

    // TODO: Add more tests as needed:
    // - Edge cases específicos de tu negocio
    // - Validaciones complejas
    // - Transformaciones de datos
  });
});
`,
    },
    // CLAUDE.md
    {
      path: path.join(basePath, 'CLAUDE.md'),
      content: `# Feature: ${pascalName}

## Propósito
[Descripción de qué hace esta feature y por qué existe]

## Decisiones de Arquitectura
- [Añadir decisiones tomadas durante la implementación]

## Dependencias
- **Tables**: ${tableName}
- **APIs externas**: Ninguna

## Testing

### Estrategia de Testing

**Consulta**: \`__tests__/README.md\` para guías y templates completos.

**Esta feature requiere** (marca una):
- [ ] **Solo E2E** - Feature simple CRUD sin lógica compleja
- [ ] **Unit + E2E** - Hay lógica de negocio/cálculos que testear
- [ ] **TBD** - Decidir después de implementar funcionalidad completa

### Tests Unitarios (si aplica)

**¿Qué testear?**:
- [ ] Validaciones complejas (más allá de \`required\`)
- [ ] Cálculos o transformaciones de datos
- [ ] Edge cases críticos para el negocio
- [ ] Funciones helper reutilizadas

**Ejecutar**:
\`\`\`bash
npm run test -- ${name}
npm run test -- ${name} --watch  # Durante desarrollo
\`\`\`

### Tests E2E (obligatorio)

**Flujos críticos**:
- [ ] Usuario puede crear ${camelName}
- [ ] Usuario puede ver lista de ${camelName}s
- [ ] Usuario puede editar ${camelName}
- [ ] Usuario puede eliminar ${camelName}
- [ ] Validaciones muestran errores claros
- [ ] RLS protege datos de otros usuarios

**Ejecutar**:
\`\`\`bash
npm run test:e2e -- ${name}
\`\`\`

## Checklist Pre-Entrega

### UX/UI
- [ ] ¿Puede completarse en menos clicks?
- [ ] ¿Está claro qué hacer sin leer instrucciones?
- [ ] ¿Hay feedback inmediato en cada acción?
- [ ] ¿Empty states invitan a tomar acción?
- [ ] ¿Funciona en mobile (touch targets, responsive)?

### i18n & Copy
- [ ] ¿TODOS los textos están en messages/*.json?
- [ ] ¿Copy orientado a beneficio, no función?
- [ ] ¿Help text en campos que lo necesiten?
- [ ] ¿Errores específicos y accionables?

### Accesibilidad
- [ ] ¿Labels asociados a inputs?
- [ ] ¿Errores tienen role="alert" o aria-live?
- [ ] ¿Navegable solo con teclado?
- [ ] ¿Focus visible en elementos interactivos?

## Deuda Técnica
[Ninguna conocida]

## Notas
- Tabla: \`${tableName}\`
- Migración generada en: \`supabase/migrations/\`
- Traducciones ya añadidas en \`messages/en.json\` y \`messages/es.json\`
- Componentes: ${pascalName}Form, ${pascalName}Empty
`,
    },
  ];

  // Create migration file
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', `${timestamp}_${snakeName}.sql`);

  const migrationContent = `-- Migration: ${pascalName}
-- Created: ${new Date().toISOString()}

-- Create table
CREATE TABLE ${tableName} (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users
CREATE POLICY "Users can view own ${tableName}"
  ON ${tableName} FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ${tableName}"
  ON ${tableName} FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ${tableName}"
  ON ${tableName} FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ${tableName}"
  ON ${tableName} FOR DELETE
  USING (auth.uid() = user_id);

-- Policy for service role
CREATE POLICY "Service role has full access to ${tableName}"
  ON ${tableName} FOR ALL
  TO service_role
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_${tableName}_updated_at
  BEFORE UPDATE ON ${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for common queries
CREATE INDEX idx_${tableName}_user_id ON ${tableName}(user_id);
`;

  // Write all feature files
  files.forEach((file) => {
    fs.writeFileSync(file.path, file.content);
  });

  // Write migration
  fs.writeFileSync(migrationPath, migrationContent);

  // Add translations placeholder
  const enPath = path.join(process.cwd(), 'messages', 'en.json');
  const esPath = path.join(process.cwd(), 'messages', 'es.json');

  const translations = {
    en: {
      page: {
        title: `${pascalName}s`,
        description: `Manage your ${camelName}s`,
      },
      form: {
        title: {
          label: 'What would you like to call it?',
          placeholder: 'e.g., My awesome project',
          help: 'Choose a name that helps you identify it later',
          errors: {
            required: 'Give it a name so you can find it easily',
          },
        },
        description: {
          label: 'Add some details',
          placeholder: 'Describe what this is for...',
          help: 'Optional but helpful for remembering the context',
          errors: {
            tooLong: 'Keep it under 500 characters',
          },
        },
      },
      empty: {
        title: 'No ${camelName}s yet',
        description: 'Create your first ${camelName} to get started. They help you organize and track your work.',
        action: 'Create your first ${camelName}',
      },
      success: {
        created: 'Your ${camelName} is ready!',
        createdDescription: 'You can now start adding details and sharing it.',
        updated: 'Changes saved',
        updatedDescription: 'Your updates are now visible.',
        deleted: '${pascalName} deleted',
        deletedDescription: 'It has been permanently removed.',
      },
      errors: {
        notFound: 'We couldn\\'t find that ${camelName}. It may have been deleted.',
        unauthorized: 'You don\\'t have permission to do this.',
      },
      actions: {
        create: 'Create ${camelName}',
        creating: 'Creating...',
        update: 'Save changes',
        updating: 'Saving...',
        delete: 'Delete',
        deleting: 'Deleting...',
      },
      list: {
        title: 'Your ${camelName}s',
        search: 'Search ${camelName}s...',
        noResults: 'No ${camelName}s match your search',
      },
    },
    es: {
      page: {
        title: `${pascalName}s`,
        description: `Gestiona tus ${camelName}s`,
      },
      form: {
        title: {
          label: '¿Cómo quieres llamarlo?',
          placeholder: 'ej., Mi proyecto increíble',
          help: 'Elige un nombre que te ayude a identificarlo después',
          errors: {
            required: 'Dale un nombre para encontrarlo fácilmente',
          },
        },
        description: {
          label: 'Añade algunos detalles',
          placeholder: 'Describe para qué es...',
          help: 'Opcional pero útil para recordar el contexto',
          errors: {
            tooLong: 'Máximo 500 caracteres',
          },
        },
      },
      empty: {
        title: 'Aún no tienes ${camelName}s',
        description: 'Crea tu primer ${camelName} para empezar. Te ayudan a organizar y seguir tu trabajo.',
        action: 'Crear mi primer ${camelName}',
      },
      success: {
        created: '¡Tu ${camelName} está listo!',
        createdDescription: 'Ya puedes empezar a añadir detalles y compartirlo.',
        updated: 'Cambios guardados',
        updatedDescription: 'Tus actualizaciones ya son visibles.',
        deleted: '${pascalName} eliminado',
        deletedDescription: 'Ha sido eliminado permanentemente.',
      },
      errors: {
        notFound: 'No encontramos ese ${camelName}. Puede que haya sido eliminado.',
        unauthorized: 'No tienes permiso para hacer esto.',
      },
      actions: {
        create: 'Crear ${camelName}',
        creating: 'Creando...',
        update: 'Guardar cambios',
        updating: 'Guardando...',
        delete: 'Eliminar',
        deleting: 'Eliminando...',
      },
      list: {
        title: 'Tus ${camelName}s',
        search: 'Buscar ${camelName}s...',
        noResults: 'Ningún ${camelName} coincide con tu búsqueda',
      },
    },
  };

  // Update translation files
  if (fs.existsSync(enPath)) {
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    enContent[camelName] = translations.en;
    fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n');
  }

  if (fs.existsSync(esPath)) {
    const esContent = JSON.parse(fs.readFileSync(esPath, 'utf-8'));
    esContent[camelName] = translations.es;
    fs.writeFileSync(esPath, JSON.stringify(esContent, null, 2) + '\n');
  }

  // Summary output
  console.log(`\n✅ Slice "${name}" created successfully!`);
  console.log(`\n📦 Generated: ${files.length} files + migration + translations`);
  console.log('\n📋 Next steps:');
  console.log(`1. Review types in src/core/features/${name}/types/`);
  console.log(`2. Apply migration: npx supabase db push`);
  console.log(`3. Update CLAUDE.md with feature purpose`);
  console.log(`4. Create page: src/app/[locale]/(app)/${name}/page.tsx`);
  console.log(`5. Run: npm run gen:types`);
  console.log(`\n📝 Testing:`);
  console.log(`   - Check __tests__/README.md for test guidelines`);
  console.log(`   - Rename .example files to .test.ts when ready to add tests`);

  rl.close();
}

main().catch(console.error);
