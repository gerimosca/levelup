Añade una nueva Server Action "$ARGUMENTS" a la feature actual.

## Pasos:

### 1. Identificar la feature
Determinar en qué feature se añadirá la action basándose en el contexto o el archivo abierto.

### 2. Añadir schema en `types/index.ts`
```typescript
export const $ARGUMENTSSchema = z.object({
  // campos con validaciones
});

export type $ARGUMENTSInput = z.infer<typeof $ARGUMENTSSchema>;
```

### 3. Crear Query o Command
Según si es lectura o escritura:

**Para lectura** (`[feature].query.ts`):
```typescript
export async function get$ARGUMENTS(userId: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('user_id', userId);
  return { data, error: error?.message || null };
}
```

**Para escritura** (`[feature].command.ts`):
```typescript
export async function $ARGUMENTS(userId: string, input: $ARGUMENTSInput) {
  const supabase = await createClientServer();
  const { error } = await supabase.from('table').insert({...});
  return { success: !error, error: error?.message || null };
}
```

### 4. Crear Handler en `[feature].handler.ts`
```typescript
export async function handle$ARGUMENTS(userId: string, input: $ARGUMENTSInput) {
  const validation = $ARGUMENTSSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message
    };
  }
  return $ARGUMENTS(userId, validation.data);
}
```

### 5. Crear Action en `[feature].actions.ts`
```typescript
'use server';

export async function $ARGUMENTSAction(prevState: any, formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const input = {
    // extraer de formData
  };

  const result = await handle$ARGUMENTS(user.id, input);

  if (result.success) {
    revalidatePath('/path');
  }

  return result;
}
```

### 6. Añadir traducciones
En `messages/en.json` y `messages/es.json`, añadir mensajes para:
- Labels
- Placeholders
- Success/error messages

### 7. Crear/actualizar componente
Si es necesario, crear o actualizar el componente que use esta action con `useActionState`.

## Verificar
- [ ] Imports solo de @/shared
- [ ] Schema con validaciones correctas
- [ ] Error handling completo
- [ ] Traducciones en ambos idiomas
- [ ] type-check pasa
