# Theme Variants System - Plan de Implementación

## 🎯 Objetivo

Crear sistema de variantes de tema (Standard, Luxury/Meritocratic, etc.) que:
- ✅ Mantiene componentes sin modificar
- ✅ Cambia look & feel completo con CSS variables
- ✅ Es extensible (añadir nuevos themes fácilmente)
- ✅ Respeta Open/Closed principle

---

## 🏗️ Arquitectura

```
src/
├── app/[locale]/
│   └── globals.css              # 🔸 EDIT: Añadir theme variants
├── core/shared/
│   ├── config/
│   │   └── brand.ts             # 🔸 EDIT: Añadir theme config
│   └── providers/
│       └── theme-provider.tsx   # 🆕 NEW: Theme context
└── my-saas/
    └── features/
        └── theme-switcher/      # 🆕 NEW: UI para cambiar theme
```

---

## 📐 Variables Clave por Dimensión

### 1️⃣ **Typography** (Critical para luxury feel)

| Variable | Standard | Luxury |
|----------|----------|--------|
| `--font-sans` | Inter | Montserrat |
| `--font-serif` | - | Playfair Display |
| `--font-display` | - | Cormorant Garamond |
| `--font-mono` | Fira Code | JetBrains Mono |
| `--font-weight-base` | 400 | 400 |
| `--font-weight-medium` | 500 | 500 |
| `--font-weight-semibold` | 600 | 600 |
| `--font-weight-bold` | 700 | 700 |
| `--letter-spacing-tight` | -0.025em | 0em |
| `--letter-spacing-normal` | 0em | 0.02em |
| `--letter-spacing-wide` | 0.025em | 0.05em |

**Luxury strategy**:
- Fuentes serif para headings (Playfair/Cormorant)
- Sans-serif elegante para body (Montserrat)
- Letter-spacing más amplio → sensación premium

---

### 2️⃣ **Colors** (Define personalidad)

| Semantic | Standard (HSL) | Luxury (HSL) |
|----------|----------------|--------------|
| `--primary` | 220 91% 54% (blue) | 38 70% 45% (gold) |
| `--primary-foreground` | 0 0% 100% | 0 0% 100% |
| `--background` | 0 0% 100% | 0 0% 6% (deep black) |
| `--foreground` | 224 71% 4% | 0 0% 95% (platinum) |
| `--accent` | 220 14% 96% | 38 70% 55% (light gold) |
| `--accent-foreground` | 224 71% 4% | 0 0% 10% |
| `--muted` | 220 14% 96% | 0 0% 12% |
| `--muted-foreground` | 220 9% 46% | 0 0% 60% |
| `--border` | 220 13% 91% | 38 30% 25% (dark gold) |
| `--card` | 0 0% 100% | 0 0% 8% |
| `--destructive` | 0 84% 60% | 0 65% 50% |

**Luxury strategy**:
- Gold como primary (exclusividad)
- Deep blacks (0 0% 6-10%)
- Low saturation (elegancia)
- Contraste sutil (no harsh)

---

### 3️⃣ **Spacing** (Breathing room = luxury)

| Variable | Standard | Luxury |
|----------|----------|--------|
| `--spacing-xs` | 0.25rem | 0.5rem |
| `--spacing-sm` | 0.5rem | 0.75rem |
| `--spacing-md` | 1rem | 1.5rem |
| `--spacing-lg` | 1.5rem | 2.5rem |
| `--spacing-xl` | 2rem | 4rem |
| `--spacing-2xl` | 3rem | 6rem |
| `--container-max-width` | 1280px | 1200px |
| `--content-max-width` | 65ch | 60ch |

**Luxury strategy**:
- Más whitespace → menos cluttered
- Container más estrecho → focus

---

### 4️⃣ **Border Radius** (Geometric vs Soft)

| Variable | Standard | Luxury |
|----------|----------|--------|
| `--radius` | 0.5rem | 0.125rem |
| `--radius-sm` | calc(var(--radius) - 4px) | 0rem |
| `--radius-md` | calc(var(--radius) - 2px) | 0.0625rem |
| `--radius-lg` | var(--radius) | 0.25rem |
| `--radius-xl` | 1rem | 0.375rem |

**Luxury strategy**: Sharp corners (arquitectónico, profesional)

---

### 5️⃣ **Shadows** (Depth & Elegance)

| Variable | Standard | Luxury |
|----------|----------|--------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | 0 2px 8px rgba(0,0,0,0.3) |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | 0 4px 16px rgba(0,0,0,0.4) |
| `--shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | 0 8px 32px rgba(0,0,0,0.5) |
| `--shadow-xl` | 0 20px 25px rgba(0,0,0,0.15) | 0 16px 64px rgba(0,0,0,0.6) |
| `--shadow-gold` | - | 0 0 20px rgba(218,165,32,0.3) |

**Luxury strategy**:
- Sombras más dramáticas
- Gold glow en elementos key

---

### 6️⃣ **Animations** (Speed & Easing)

| Variable | Standard | Luxury |
|----------|----------|--------|
| `--transition-fast` | 150ms | 250ms |
| `--transition-base` | 200ms | 400ms |
| `--transition-slow` | 300ms | 600ms |
| `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | cubic-bezier(0.4, 0, 0.2, 1) |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | cubic-bezier(0, 0, 0.2, 1) |
| `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | cubic-bezier(0.65, 0, 0.35, 1) |

**Luxury strategy**:
- Transiciones más lentas (deliberate, not rushed)
- Easing curves más suaves

---

### 7️⃣ **Effects** (Luxury-specific)

| Variable | Standard | Luxury |
|----------|----------|--------|
| `--backdrop-blur` | 8px | 16px |
| `--glass-opacity` | 0.8 | 0.6 |
| `--border-width` | 1px | 1px |
| `--border-accent-width` | - | 2px |
| `--gradient-gold` | - | linear-gradient(135deg, #d4af37 0%, #f4e4a6 50%, #d4af37 100%) |

---

## 🎨 Ejemplo: globals.css

```css
@layer base {
  /* ============================================= */
  /* STANDARD THEME (default) */
  /* ============================================= */
  :root {
    /* Typography */
    --font-sans: 'Inter', system-ui, sans-serif;
    --letter-spacing-tight: -0.025em;
    --letter-spacing-normal: 0em;
    --letter-spacing-wide: 0.025em;

    /* Colors */
    --background: 0 0% 100%;
    --foreground: 224 71% 4%;
    --primary: 220 91% 54%;
    --primary-foreground: 0 0% 100%;
    --accent: 220 14% 96%;
    --border: 220 13% 91%;

    /* Spacing */
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;

    /* Border Radius */
    --radius: 0.5rem;

    /* Shadows */
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);

    /* Animations */
    --transition-base: 200ms;
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ============================================= */
  /* LUXURY/MERITOCRATIC THEME */
  /* ============================================= */
  [data-theme="luxury"] {
    /* Typography */
    --font-sans: 'Montserrat', system-ui, sans-serif;
    --font-serif: 'Playfair Display', serif;
    --font-display: 'Cormorant Garamond', serif;
    --letter-spacing-tight: 0em;
    --letter-spacing-normal: 0.02em;
    --letter-spacing-wide: 0.05em;

    /* Colors - Gold & Deep Black Palette */
    --background: 0 0% 6%;           /* Deep black */
    --foreground: 0 0% 95%;          /* Platinum white */
    --primary: 38 70% 45%;           /* Gold */
    --primary-foreground: 0 0% 100%;
    --accent: 38 70% 55%;            /* Light gold */
    --accent-foreground: 0 0% 10%;
    --muted: 0 0% 12%;
    --muted-foreground: 0 0% 60%;
    --border: 38 30% 25%;            /* Dark gold */
    --card: 0 0% 8%;
    --card-foreground: 0 0% 95%;
    --destructive: 0 65% 50%;

    /* Spacing - More generous */
    --spacing-md: 1.5rem;
    --spacing-lg: 2.5rem;
    --spacing-xl: 4rem;

    /* Border Radius - Sharp/Architectural */
    --radius: 0.125rem;

    /* Shadows - Dramatic */
    --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
    --shadow-gold: 0 0 20px rgba(218,165,32,0.3);

    /* Animations - Slower, more deliberate */
    --transition-base: 400ms;
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

    /* Effects */
    --backdrop-blur: 16px;
    --gradient-gold: linear-gradient(135deg, #d4af37 0%, #f4e4a6 50%, #d4af37 100%);
  }

  /* Dark mode for Standard theme */
  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    /* ... resto igual */
  }

  /* Dark mode for Luxury (already dark by default) */
  [data-theme="luxury"].dark {
    /* Opcional: versión aún más oscura si se necesita */
  }
}
```

---

## 🛠️ Implementación

### 1. Theme Provider

```typescript
// src/core/shared/providers/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemeVariant = 'standard' | 'luxury';

interface ThemeContextValue {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<ThemeVariant>('standard');

  useEffect(() => {
    // Leer de localStorage
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

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### 2. Theme Switcher Component

```typescript
// src/my-saas/features/theme-switcher/theme-switcher.tsx
'use client';

import { useTheme } from '@/core/shared/providers/theme-provider';
import { Button } from '@/core/shared/components/ui/button';

export function ThemeSwitcher() {
  const { variant, setVariant } = useTheme();

  return (
    <div className="flex gap-2">
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
    </div>
  );
}
```

### 3. Extended Brand Config

```typescript
// src/core/shared/config/brand.ts (añadir sección)

export const brand = {
  // ... existing config

  // Theme variants configuration
  themes: {
    default: 'standard' as const,
    available: ['standard', 'luxury'] as const,

    variants: {
      standard: {
        name: 'Standard',
        description: 'Clean, modern design for everyone',
        font: {
          family: 'Inter',
          package: '@fontsource/inter',
          weights: [400, 500, 600, 700],
        },
      },
      luxury: {
        name: 'Luxury',
        description: 'Premium, exclusive design for top professionals',
        fonts: {
          sans: {
            family: 'Montserrat',
            package: '@fontsource/montserrat',
            weights: [400, 500, 600, 700],
          },
          serif: {
            family: 'Playfair Display',
            package: '@fontsource/playfair-display',
            weights: [400, 600, 700],
          },
          display: {
            family: 'Cormorant Garamond',
            package: '@fontsource/cormorant-garamond',
            weights: [400, 600, 700],
          },
        },
      },
    },
  },
};
```

---

## 🎯 Benefits

✅ **Zero component changes**: Componentes usan `className="bg-background text-foreground"` → funciona con cualquier theme

✅ **Easy to add themes**: Solo añadir nuevo `[data-theme="new"]` block en CSS

✅ **Type-safe**: TypeScript types para theme variants

✅ **SSR-friendly**: Theme se aplica vía data attribute (no flash)

✅ **User preference**: Guardado en localStorage

---

## 🚀 Roadmap

### Phase 1: Foundation (Day 1)
- [ ] Añadir CSS variables para luxury theme en globals.css
- [ ] Crear ThemeProvider
- [ ] Instalar fuentes luxury (Montserrat, Playfair, Cormorant)
- [ ] Actualizar brand.ts con theme config

### Phase 2: UI (Day 2)
- [ ] Crear ThemeSwitcher component
- [ ] Añadir a dashboard settings
- [ ] Testing visual de cada theme

### Phase 3: Advanced (Optional)
- [ ] Per-route themes (dashboard = standard, landing = luxury)
- [ ] A/B testing integration
- [ ] Theme analytics

---

## 📊 Theme Comparison

| Aspect | Standard | Luxury |
|--------|----------|--------|
| **Vibe** | Approachable, modern | Exclusive, prestigious |
| **Target** | General users | Top professionals, VIPs |
| **Typography** | Sans-serif (Inter) | Serif headings + elegant sans body |
| **Colors** | Blue primary, light BG | Gold primary, deep black BG |
| **Spacing** | Efficient | Generous (breathing room) |
| **Borders** | Rounded (friendly) | Sharp (architectural) |
| **Animations** | Fast (200ms) | Deliberate (400ms) |
| **Message** | "Build fast" | "Built for the best" |

---

## 🎨 Design Philosophy: Luxury Theme

**Principles**:
1. **Exclusivity over accessibility**: No todo el mundo debe sentirse cómodo aquí
2. **Subtlety over flash**: Elegancia, no bling
3. **Space = luxury**: Más whitespace, menos clutter
4. **Typography as hero**: La fuente lleva el peso visual
5. **Contrast with intention**: Alto contraste donde importa, sutil donde no

**Anti-patterns to avoid**:
- ❌ Too much gold (tacky)
- ❌ Animation overload (cheesy)
- ❌ Comic Sans vibes
- ❌ Cluttered layouts

---

## 💡 Next Steps

1. **Review este plan** - ¿Te convence la aproximación?
2. **Refinar luxury palette** - ¿Gold es el color correcto o prefieres platinum/dark blue?
3. **Choose fonts** - ¿Playfair/Cormorant o otras?
4. **Implementation** - Ejecutar Phase 1

**Pregunta clave**: ¿Este luxury theme debe ser:
- **Publicly selectable** (users eligen en settings)
- **Gated by tier** (solo Pro/Enterprise)
- **Hardcoded by route** (landing = standard, app = luxury)
