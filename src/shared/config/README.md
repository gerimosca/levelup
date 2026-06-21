# Config

Configuración centralizada de la aplicación.

## Archivos

### `brand.ts`
Configuración de marca e identidad del SaaS.

**Qué modificar aquí:**
- Nombre de la app
- Logo y favicon
- URLs (website, support)
- Fuente tipográfica
- Theme settings (glassmorphism)
- SEO (title, description)
- Redes sociales
- Links legales (terms, privacy)
- Copyright

**Ejemplo de uso:**
```typescript
import { brand } from '@/shared/config/brand';

// En un componente
<h1>{brand.name}</h1>
<img src={brand.logo} alt={brand.name} />
```

## Colores del Tema

Los colores se definen en `/src/app/[locale]/globals.css` usando CSS variables.

Para cambiar colores:
1. Ve a https://ui.shadcn.com/themes
2. Elige un tema
3. Copia las CSS variables
4. Reemplaza en globals.css

**Variables principales:**
- `--primary` - Color principal (botones, links)
- `--secondary` - Color secundario
- `--accent` - Color de acento
- `--destructive` - Color de error
- `--background` - Fondo
- `--foreground` - Texto

## Cambiar Fuente Tipográfica

La fuente actual es **Inter**. Para cambiarla:

### 1. Instalar nueva fuente
```bash
npm install @fontsource/[nombre-fuente]
# Ejemplo: npm install @fontsource/geist-sans
```

### 2. Actualizar brand.ts
```typescript
font: {
  family: 'Geist Sans',
  package: '@fontsource/geist-sans',
  weights: [400, 500, 600, 700],
}
```

### 3. Actualizar globals.css
Cambiar los imports al inicio del archivo:
```css
@import '@fontsource/geist-sans/400.css';
@import '@fontsource/geist-sans/500.css';
@import '@fontsource/geist-sans/600.css';
@import '@fontsource/geist-sans/700.css';
```

### 4. Actualizar tailwind.config.ts
```typescript
fontFamily: {
  sans: ['Geist Sans', 'system-ui', 'sans-serif'],
}
```

### Fuentes Recomendadas
- `@fontsource/inter` - Limpia, moderna (default)
- `@fontsource/geist-sans` - Vercel's font
- `@fontsource/plus-jakarta-sans` - Friendly, modern
- `@fontsource/dm-sans` - Geometric, clean

Ver todas en: https://fontsource.org/

## Glassmorphism

El boilerplate soporta efecto glass (backdrop-blur, transparencias) configurable.

### Activar/Desactivar

En `brand.ts`:
```typescript
theme: {
  glass: true,  // true = glass effect, false = solid backgrounds
}
```

### Cómo funciona

Cuando `glass: true`:
- Sidebar, header y mobile menu usan backdrop-blur
- Background tiene gradiente sutil para que el blur sea visible
- Bordes semi-transparentes

Cuando `glass: false`:
- Backgrounds sólidos
- Bordes normales
- Sin blur

### Clases disponibles

En tus componentes puedes usar:
```tsx
// Importar desde globals.css
<div className="glass">...</div>        // Standard glass
<div className="glass-subtle">...</div> // Lighter blur
<div className="glass-strong">...</div> // Stronger blur
```

### Consideraciones

- Glass funciona mejor con dark mode
- Requiere background con contenido/color para que el blur sea visible
- Mayor uso de GPU (considerar en dispositivos low-end)
