# UI Components

Componentes base de shadcn/ui personalizados para el proyecto.

## Componentes Incluidos

- `Button` - Botones con variantes
- `Input` - Campo de texto
- `Label` - Etiquetas para formularios
- `Card` - Tarjetas con header/content/footer
- `Avatar` - Avatar de usuario

## Cómo Usar

```typescript
import { Button, Input, Card } from '@/shared/components/ui';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Email" />
      <Button>Submit</Button>
    </Card>
  );
}
```

## Añadir Nuevos Componentes

### Opción 1: CLI de shadcn (recomendado)
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

Los componentes se añadirán automáticamente a esta carpeta.

### Opción 2: Manual
1. Copiar código de https://ui.shadcn.com/docs/components
2. Crear archivo en esta carpeta
3. Exportar desde `index.ts`

## Personalizar Componentes

Puedes modificar cualquier componente directamente. Por ejemplo, para cambiar el estilo del Button:

```typescript
// button.tsx
const buttonVariants = cva(
  'inline-flex items-center...', // Clases base
  {
    variants: {
      variant: {
        default: 'bg-primary...', // Modificar aquí
      },
    },
  }
);
```

## Crear Componentes Personalizados

Para componentes específicos de tu marca:

```typescript
// primary-button.tsx
import { Button, ButtonProps } from './button';

export function PrimaryButton(props: ButtonProps) {
  return (
    <Button
      variant="default"
      className="bg-brand-500 hover:bg-brand-600"
      {...props}
    />
  );
}
```

## Configuración

El archivo `/components.json` en la raíz configura shadcn:
- Rutas de componentes
- Alias de importación
- Estilo (default/new-york)
