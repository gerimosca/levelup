# Theme Variants - Escalabilidad y Dark Mode

## ✅ Respuestas Rápidas

| Pregunta | Respuesta |
|----------|-----------|
| **¿Escalable para añadir más temas?** | ✅ Sí. Añadir `[data-theme="nuevo"]` en CSS = listo |
| **¿Convive con dark mode?** | ✅ Sí. Son dimensiones independientes (`data-theme` + `.dark`) |
| **¿Fácil cambiar de tema?** | ✅ Sí. `setVariant('luxury')` o dropdown en UI |
| **¿Costo de añadir nuevo tema?** | ~30 min (copiar CSS vars, ajustar valores, añadir fuentes) |

---

## 🎨 1. Escalabilidad: Añadir Nuevos Temas

### Ejemplo: Añadir "Corporate" Theme

**Paso 1**: Definir en `brand.ts` (2 min)

```typescript
// src/core/shared/config/brand.ts
themes: {
  default: 'standard',
  available: ['standard', 'luxury', 'corporate'], // ← Añadir aquí

  variants: {
    standard: { /* ... */ },
    luxury: { /* ... */ },

    // ✅ NUEVO TEMA
    corporate: {
      name: 'Corporate',
      description: 'Professional, enterprise-ready design',
      fonts: {
        sans: {
          family: 'IBM Plex Sans',
          package: '@fontsource/ibm-plex-sans',
          weights: [400, 500, 600, 700],
        },
      },
    },
  },
}
```

**Paso 2**: Añadir CSS variables en `globals.css` (20 min)

```css
/* ============================================= */
/* CORPORATE THEME */
/* ============================================= */
[data-theme="corporate"] {
  /* Typography */
  --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
  --letter-spacing-normal: 0.01em;

  /* Colors - Blue corporate palette */
  --background: 0 0% 100%;
  --foreground: 220 20% 10%;
  --primary: 210 100% 45%;        /* Corporate blue */
  --primary-foreground: 0 0% 100%;
  --accent: 210 50% 92%;
  --border: 210 20% 85%;
  --card: 0 0% 100%;

  /* Spacing - Standard but organized */
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;

  /* Border Radius - Slightly rounded */
  --radius: 0.25rem;

  /* Shadows - Professional, not flashy */
  --shadow-md: 0 2px 8px rgba(0,0,0,0.08);

  /* Animations - Efficient */
  --transition-base: 150ms;
}
```

**Paso 3**: Instalar fuentes (5 min)

```bash
npm install @fontsource/ibm-plex-sans
```

**Paso 4**: Importar en `globals.css` (2 min)

```css
@import '@fontsource/ibm-plex-sans/400.css';
@import '@fontsource/ibm-plex-sans/500.css';
@import '@fontsource/ibm-plex-sans/600.css';
@import '@fontsource/ibm-plex-sans/700.css';
```

**Paso 5**: TypeScript types (auto-detectado)

```typescript
// El type se actualiza automáticamente
type ThemeVariant = 'standard' | 'luxury' | 'corporate';
```

✅ **Total: ~30 minutos** para un tema nuevo completamente funcional.

---

## 🌓 2. Convivencia con Dark Mode

### Arquitectura: Dos Dimensiones Independientes

```
Dimension 1: Theme Variant  → data-theme="standard|luxury|corporate"
Dimension 2: Dark Mode      → class="dark"
```

Esto permite **4 combinaciones** por cada tema:

| Combinación | Selector CSS |
|-------------|--------------|
| Standard Light | `:root` (default) |
| Standard Dark | `.dark` |
| Luxury Light | `[data-theme="luxury"]` |
| Luxury Dark | `[data-theme="luxury"].dark` |
| Corporate Light | `[data-theme="corporate"]` |
| Corporate Dark | `[data-theme="corporate"].dark` |

### Implementación en globals.css

```css
/* ============================================= */
/* STANDARD THEME */
/* ============================================= */
:root {
  --background: 0 0% 100%;
  --foreground: 224 71% 4%;
  /* ... */
}

/* Standard Dark Mode */
.dark {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
  /* ... */
}

/* ============================================= */
/* LUXURY THEME */
/* ============================================= */
[data-theme="luxury"] {
  /* Luxury light mode (default) */
  --background: 0 0% 6%;      /* Ya es oscuro por defecto */
  --foreground: 0 0% 95%;
  --primary: 38 70% 45%;      /* Gold */
  /* ... */
}

/* Luxury Dark Mode (even darker) */
[data-theme="luxury"].dark {
  --background: 0 0% 3%;      /* Aún más oscuro */
  --foreground: 0 0% 98%;
  --primary: 38 80% 50%;      /* Gold más brillante */
  /* ... */
}

/* ============================================= */
/* CORPORATE THEME */
/* ============================================= */
[data-theme="corporate"] {
  /* Corporate light mode */
  --background: 0 0% 100%;
  --foreground: 220 20% 10%;
  --primary: 210 100% 45%;
  /* ... */
}

/* Corporate Dark Mode */
[data-theme="corporate"].dark {
  --background: 220 20% 8%;
  --foreground: 210 10% 95%;
  --primary: 210 100% 55%;    /* Más brillante en dark */
  /* ... */
}
```

### ThemeProvider con Dark Mode Support

```typescript
// src/core/shared/providers/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes'; // ← next-themes para dark mode

type ThemeVariant = 'standard' | 'luxury' | 'corporate';

interface ThemeContextValue {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => void;
  // Dark mode viene de next-themes
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<ThemeVariant>('standard');
  const { theme: darkMode } = useNextTheme(); // 'light' | 'dark' | 'system'

  useEffect(() => {
    const stored = localStorage.getItem('theme-variant') as ThemeVariant;
    if (stored) setVariant(stored);
  }, []);

  useEffect(() => {
    // Aplicar data-theme attribute
    document.documentElement.setAttribute('data-theme', variant);
    localStorage.setItem('theme-variant', variant);
  }, [variant]);

  return (
    <ThemeContext.Provider value={{ variant, setVariant }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeVariant() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeVariant must be used within ThemeProvider');
  return context;
}
```

### UI: Dual Controls

```typescript
// src/my-saas/features/theme-switcher/theme-controls.tsx
'use client';

import { useThemeVariant } from '@/core/shared/providers/theme-provider';
import { useTheme } from 'next-themes'; // Dark mode toggle
import { Button } from '@/core/shared/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeControls() {
  const { variant, setVariant } = useThemeVariant();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      {/* Theme Variant Selector */}
      <div>
        <label className="text-sm font-medium">Theme Style</label>
        <div className="flex gap-2 mt-2">
          <Button
            variant={variant === 'standard' ? 'default' : 'outline'}
            onClick={() => setVariant('standard')}
          >
            Standard
          </Button>
          <Button
            variant={variant === 'luxury' ? 'default' : 'outline'}
            onClick={() => setVariant('luxury')}
          >
            Luxury
          </Button>
          <Button
            variant={variant === 'corporate' ? 'default' : 'outline'}
            onClick={() => setVariant('corporate')}
          >
            Corporate
          </Button>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div>
        <label className="text-sm font-medium">Brightness</label>
        <div className="flex gap-2 mt-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
          >
            <Sun className="w-4 h-4 mr-2" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 3. Cambiar de Tema: Todas las Formas

### Opción 1: UI Component (User-facing)

```typescript
// En settings page
import { ThemeControls } from '@/my-saas/features/theme-switcher';

export default function SettingsPage() {
  return (
    <div>
      <h2>Appearance</h2>
      <ThemeControls />
    </div>
  );
}
```

### Opción 2: Programáticamente

```typescript
// En cualquier client component
import { useThemeVariant } from '@/core/shared/providers/theme-provider';

function MyComponent() {
  const { setVariant } = useThemeVariant();

  const upgradeToPro = () => {
    // Al upgradearse a Pro, cambiar a luxury theme
    setVariant('luxury');
  };

  return <Button onClick={upgradeToPro}>Upgrade to Pro</Button>;
}
```

### Opción 3: URL Parameter (A/B Testing)

```typescript
// En layout.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useThemeVariant } from '@/core/shared/providers/theme-provider';

export function ThemeInitializer() {
  const searchParams = useSearchParams();
  const { setVariant } = useThemeVariant();

  useEffect(() => {
    // ?theme=luxury en URL
    const urlTheme = searchParams.get('theme');
    if (urlTheme === 'luxury' || urlTheme === 'corporate') {
      setVariant(urlTheme);
    }
  }, [searchParams, setVariant]);

  return null;
}
```

### Opción 4: Basado en Plan del Usuario

```typescript
// En app layout
'use client';

import { useEffect } from 'react';
import { useThemeVariant } from '@/core/shared/providers/theme-provider';

export function ThemeByPlan({ userPlan }: { userPlan: string }) {
  const { setVariant } = useThemeVariant();

  useEffect(() => {
    // Auto-aplicar luxury theme para Pro/Enterprise
    if (userPlan === 'pro' || userPlan === 'enterprise') {
      setVariant('luxury');
    } else {
      setVariant('standard');
    }
  }, [userPlan, setVariant]);

  return null;
}
```

### Opción 5: Por Ruta (Hardcoded)

```typescript
// En route layout
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeVariant } from '@/core/shared/providers/theme-provider';

export function ThemeByRoute() {
  const pathname = usePathname();
  const { setVariant } = useThemeVariant();

  useEffect(() => {
    // Landing page = luxury, dashboard = standard
    if (pathname === '/' || pathname.startsWith('/landing')) {
      setVariant('luxury');
    } else if (pathname.startsWith('/dashboard')) {
      setVariant('standard');
    }
  }, [pathname, setVariant]);

  return null;
}
```

---

## 📊 Escalabilidad: Comparación de Sistemas

| Aspecto | Nuestro Sistema | Sistema de Variantes en Components | Multiple CSS Files |
|---------|-----------------|-------------------------------------|-------------------|
| **Añadir tema** | 30 min (CSS vars) | 2+ horas (editar todos los components) | 1+ hora (nuevo archivo) |
| **Mantener** | Fácil (un lugar) | Difícil (N componentes) | Medio (M archivos) |
| **Performance** | Óptimo (CSS vars) | Óptimo | Malo (cargar múltiples CSS) |
| **Type-safe** | ✅ Sí | ✅ Sí | ❌ No |
| **Dark mode** | ✅ Ortogonal | ⚠️ Complicado | ⚠️ Complicado |
| **Bundle size** | Pequeño | Pequeño | Grande (múltiples CSS) |

---

## 🎯 Ejemplo Completo: Añadir "Gaming" Theme

**Tiempo total: 25 minutos**

### 1. Brand Config (2 min)

```typescript
gaming: {
  name: 'Gaming',
  description: 'Cyberpunk-inspired design for gamers',
  fonts: {
    sans: {
      family: 'Rajdhani',
      package: '@fontsource/rajdhani',
      weights: [400, 600, 700],
    },
  },
},
```

### 2. Install Font (1 min)

```bash
npm install @fontsource/rajdhani
```

### 3. Import Font (1 min)

```css
@import '@fontsource/rajdhani/400.css';
@import '@fontsource/rajdhani/600.css';
@import '@fontsource/rajdhani/700.css';
```

### 4. CSS Variables (20 min)

```css
/* ============================================= */
/* GAMING THEME (Cyberpunk) */
/* ============================================= */
[data-theme="gaming"] {
  /* Typography - Futuristic */
  --font-sans: 'Rajdhani', system-ui, sans-serif;
  --letter-spacing-wide: 0.1em;

  /* Colors - Neon cyberpunk */
  --background: 240 10% 5%;           /* Almost black */
  --foreground: 280 100% 90%;         /* Neon purple/pink */
  --primary: 280 100% 60%;            /* Neon purple */
  --primary-foreground: 0 0% 0%;
  --accent: 180 100% 50%;             /* Neon cyan */
  --accent-foreground: 0 0% 0%;
  --border: 280 70% 30%;              /* Purple border */
  --card: 240 10% 8%;

  /* Spacing - Compact (gaming UI) */
  --spacing-md: 0.75rem;
  --spacing-lg: 1.25rem;

  /* Border Radius - Sharp edges */
  --radius: 0rem;

  /* Shadows - Neon glow */
  --shadow-md: 0 0 15px rgba(200, 0, 255, 0.5);
  --shadow-neon: 0 0 30px rgba(200, 0, 255, 0.8);

  /* Animations - Snappy */
  --transition-base: 100ms;
}

/* Gaming Dark Mode (even more intense) */
[data-theme="gaming"].dark {
  --background: 0 0% 0%;              /* Pure black */
  --primary: 280 100% 70%;            /* Brighter neon */
  --shadow-neon: 0 0 40px rgba(200, 0, 255, 1);
}
```

### 5. Test (1 min)

```typescript
setVariant('gaming');
```

✅ **Listo**: Theme gaming completo en 25 minutos.

---

## 🚀 Conclusión

### ✅ Escalabilidad

| Métrica | Valor |
|---------|-------|
| **Tiempo para nuevo tema** | 25-30 min |
| **Temas soportados** | Ilimitados |
| **Costo de mantenimiento** | Bajo (un archivo CSS) |
| **Breaking changes** | 0 (componentes no se tocan) |

### ✅ Dark Mode

- Convive perfectamente (dimensiones independientes)
- Cada tema puede tener light + dark variants
- Next-themes maneja dark mode, nosotros manejamos variant

### ✅ Cambio de Tema

**6 formas de cambiar**:
1. UI dropdown (user choice)
2. `setVariant()` programático
3. URL parameter (A/B testing)
4. Basado en plan (Pro = luxury)
5. Por ruta (landing = luxury, app = standard)
6. Preferencia guardada (localStorage)

---

## 💡 Recomendación Final

**Para tu SaaS**:

1. **Standard theme**: Default para todos
2. **Luxury theme**: Gated para Pro/Enterprise (auto-applied)
3. **Corporate theme**: Opcional para empresas B2B

**Implementación sugerida**:
```typescript
// Auto-aplicar luxury si user es Pro+
useEffect(() => {
  if (user?.plan === 'pro' || user?.plan === 'enterprise') {
    setVariant('luxury');
  }
}, [user?.plan]);
```

Así conviertes el luxury theme en un **beneficio tangible** del upgrade a Pro 🎯
