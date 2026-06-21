# Features

Funcionalidades de negocio usando Vertical Slice Architecture (VSA).

## Estructura de una Feature

```
/features/[nombre]/
├── components/           # Componentes UI
│   └── index.ts
├── types/               # Tipos y schemas Zod
│   └── index.ts
├── [nombre].command.ts  # Operaciones de escritura
├── [nombre].query.ts    # Operaciones de lectura
├── [nombre].handler.ts  # Lógica de negocio
├── [nombre].actions.ts  # Server Actions
└── index.ts             # Exports públicos
```

## Features Incluidas

- **auth** - Login, registro, magic links
- **billing** - Pagos y suscripciones con Stripe
- **dashboard** - Panel principal con stats
- **my-account** - Perfil y preferencias

## Crear Nueva Feature

### Opción 1: Generador (recomendado)
```bash
npm run generate:slice
```

### Opción 2: Manual
1. Crear carpeta en `/features`
2. Crear todos los archivos del patrón CQRS
3. Exportar desde `index.ts`

## Patrón CQRS

### `.query.ts` - Leer datos
```typescript
export async function getFeature(id: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error: error?.message || null };
}
```

### `.command.ts` - Escribir datos
```typescript
export async function createFeature(input: FeatureInput) {
  const supabase = await createClientServer();
  const { error } = await supabase
    .from('features')
    .insert(input);
  return { success: !error, error: error?.message || null };
}
```

### `.handler.ts` - Lógica de negocio
```typescript
export async function handleCreateFeature(input: FeatureInput) {
  // Validar
  const validation = featureSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.message };
  }
  // Ejecutar
  return createFeature(validation.data);
}
```

### `.actions.ts` - Server Actions
```typescript
'use server';

export async function createFeatureAction(
  prevState: State | null,
  formData: FormData
) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const input = { name: formData.get('name') as string };
  const result = await handleCreateFeature(input);

  if (result.success) revalidatePath('/features');
  return result;
}
```

## Reglas

1. **No importar entre features** - Solo desde `@/shared/*`
2. **Validar en handler** - Usar Zod para validación
3. **Auth en actions** - Verificar usuario en server actions
4. **Revalidar paths** - Después de mutaciones

## Añadir Páginas

Las páginas van en `/src/app/[locale]/`:
```
/src/app/[locale]/(app)/[nombre-feature]/page.tsx
```
