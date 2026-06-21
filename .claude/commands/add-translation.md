Añade las traducciones para "$ARGUMENTS" en messages/en.json y messages/es.json.

## Proceso:

### 1. Identificar el namespace
Basándose en $ARGUMENTS, determinar:
- Si es un namespace existente (auth, billing, myAccount, etc.)
- Si necesita un namespace nuevo

### 2. Analizar qué traducir
Si $ARGUMENTS contiene keys específicas, usarlas.
Si no, inferir del contexto:
- Labels de formulario
- Placeholders
- Botones
- Mensajes de éxito/error
- Títulos y descripciones

### 3. Estructura de traducciones

**messages/en.json:**
```json
{
  "namespace": {
    "title": "Title",
    "description": "Description text",
    "form": {
      "fieldLabel": "Field Label",
      "fieldPlaceholder": "Enter value..."
    },
    "actions": {
      "submit": "Submit",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "messages": {
      "success": "Operation completed successfully",
      "error": "An error occurred",
      "loading": "Loading..."
    }
  }
}
```

**messages/es.json:**
```json
{
  "namespace": {
    "title": "Título",
    "description": "Texto descriptivo",
    "form": {
      "fieldLabel": "Etiqueta del campo",
      "fieldPlaceholder": "Ingresa un valor..."
    },
    "actions": {
      "submit": "Enviar",
      "cancel": "Cancelar",
      "delete": "Eliminar"
    },
    "messages": {
      "success": "Operación completada exitosamente",
      "error": "Ocurrió un error",
      "loading": "Cargando..."
    }
  }
}
```

### 4. Convenciones
- Keys en camelCase
- Textos descriptivos y claros
- Consistencia con traducciones existentes
- No hardcodear textos en componentes

### 5. Uso en componentes
```typescript
import { useTranslations } from 'next-intl';

export function Component() {
  const t = useTranslations('namespace');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 6. Verificar
- [ ] Ambos archivos tienen las mismas keys
- [ ] Traducciones tienen sentido en contexto
- [ ] No hay keys duplicadas
- [ ] JSON válido (sin trailing commas)
