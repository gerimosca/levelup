# Theme Variants - Implementación Mínima (Sin UI)

## 🎯 Objetivo

Aplicar luxury theme automáticamente a Pro users **sin UI, sin overhead, sin complejidad**.

---

## ⚡ Implementación: 15 Minutos

### Step 1: Añadir CSS Variables (10 min)

**Archivo**: `src/app/[locale]/globals.css`

```css
/* Añadir al final del archivo, después de :root y .dark */

/* ============================================= */
/* LUXURY THEME - Auto-applied for Pro users */
/* ============================================= */
[data-theme="luxury"] {
  /* Typography */
  --font-sans: 'Montserrat', system-ui, sans-serif;
  --letter-spacing-normal: 0.02em;
  --letter-spacing-wide: 0.05em;

  /* Colors - Gold & Deep Black */
  --background: 0 0% 6%;
  --foreground: 0 0% 95%;
  --card: 0 0% 8%;
  --card-foreground: 0 0% 95%;
  --popover: 0 0% 8%;
  --popover-foreground: 0 0% 95%;
  --primary: 38 70% 45%;              /* Gold */
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 12%;
  --secondary-foreground: 0 0% 95%;
  --muted: 0 0% 12%;
  --muted-foreground: 0 0% 60%;
  --accent: 38 70% 55%;               /* Light gold */
  --accent-foreground: 0 0% 10%;
  --destructive: 0 65% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 38 30% 25%;               /* Dark gold */
  --input: 38 30% 25%;
  --ring: 38 70% 45%;

  /* Spacing - More generous */
  --radius: 0.125rem;                 /* Sharp corners */

  /* Effects */
  --shadow-gold: 0 0 20px rgba(218, 165, 32, 0.3);
}

/* Luxury Dark Mode (even darker) */
[data-theme="luxury"].dark {
  --background: 0 0% 3%;
  --card: 0 0% 5%;
  --primary: 38 80% 50%;              /* Brighter gold in dark */
}
```

---

### Step 2: Auto-aplicar en Layout (5 min)

**Archivo**: `src/app/[locale]/layout.tsx`

```typescript
import { getUser } from '@/core/shared/auth';

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const user = await getUser();

  // Auto-apply luxury theme for Pro users
  const themeVariant = user?.subscription?.plan === 'pro' ? 'luxury' : 'standard';

  return (
    <html
      lang={locale}
      data-theme={themeVariant}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
```

---

### Step 3: Install Luxury Font (Opcional, 5 min)

**Si quieres usar Montserrat en lugar de Inter para luxury theme**:

```bash
npm install @fontsource/montserrat
```

**Importar en `globals.css`**:

```css
/* Añadir al inicio del archivo, junto a Inter */
@import '@fontsource/montserrat/400.css';
@import '@fontsource/montserrat/500.css';
@import '@fontsource/montserrat/600.css';
@import '@fontsource/montserrat/700.css';
```

**⚠️ NOTA**: Si omites este paso, luxury theme usará Inter (que ya tienes). Funciona igual, solo sin cambio de fuente.

---

## ✅ Eso es Todo

**Total: 15-20 minutos de trabajo**

**Resultado**:
- Free users → Standard theme (blue, light, rounded)
- Pro users → Luxury theme (gold, dark, sharp) **automáticamente**

**Sin**:
- ❌ UI de settings
- ❌ Provider context
- ❌ JavaScript client-side
- ❌ Overhead de performance

---

## 🎨 Cómo se Ve

### Standard Theme (Free users)
```
Colors:    Blue primary, white background
Typography: Inter, normal spacing
Borders:   Rounded (0.5rem)
Vibe:      Friendly, approachable
```

### Luxury Theme (Pro users)
```
Colors:    Gold primary, deep black background
Typography: Montserrat (or Inter), wider spacing
Borders:   Sharp (0.125rem)
Vibe:      Exclusive, premium
```

---

## 🔧 Variaciones (Opcional)

### Variación 1: Aplicar por Ruta (No por Plan)

```typescript
// Landing = luxury, Dashboard = standard
const pathname = headers().get('x-pathname') || '/';
const themeVariant = pathname === '/' ? 'luxury' : 'standard';
```

### Variación 2: Aplicar a Enterprise Tier

```typescript
const plan = user?.subscription?.plan;
const themeVariant = plan === 'enterprise' ? 'luxury' : 'standard';
```

### Variación 3: Hardcoded (Todos luxury)

```typescript
const themeVariant = 'luxury'; // Everyone gets luxury
```

---

## 🚀 Testing

### Test 1: Free User
1. Login como free user
2. Verify: Background es blanco, primary es azul

### Test 2: Pro User
1. Login como pro user
2. Verify: Background es negro, primary es dorado

### Test 3: Dark Mode
1. Toggle dark mode
2. Verify: Theme variant persiste (luxury dark o standard dark)

---

## 📊 Performance

**Overhead añadido**: **~0ms**

- No hay JavaScript client-side
- No hay re-renders
- Solo CSS nativo del browser

**Bundle size impact**: **+0.5KB** (CSS variables comprimidas)

---

## 🎯 Beneficios de Este Approach

1. **Súper simple**: 15 min de trabajo, cero complejidad
2. **Performance perfecto**: Cero overhead
3. **Marketing hook**: "Pro users get exclusive luxury UI"
4. **Fácil de revertir**: Cambiar 1 línea si no te gusta
5. **Escalable**: Añadir más themes después es trivial

---

## ❓ FAQs

**Q: ¿Puedo dejar que users elijan manualmente?**
A: Sí, pero requiere añadir Provider + UI (ver THEME_VARIANTS_PLAN.md)

**Q: ¿Puedo tener 3+ themes?**
A: Sí, añadir `[data-theme="corporate"]` en CSS y lógica en layout

**Q: ¿Funciona con dark mode?**
A: Sí, son ortogonales (ver THEME_VARIANTS_SCALABILITY.md)

**Q: ¿Qué pasa si no instalo Montserrat?**
A: Luxury theme usa Inter (ya instalada), funciona perfecto

**Q: ¿Puedo A/B testear esto?**
A: Sí, cambiar lógica a: `const themeVariant = abTestGroup === 'B' ? 'luxury' : 'standard'`

---

## 🎨 Next Steps (Opcional)

Si después de implementar esto quieres:
- ✅ Dejar que users elijan manualmente → Añadir UI (ver THEME_VARIANTS_PLAN.md)
- ✅ Añadir más themes (corporate, gaming) → Ver THEME_VARIANTS_SCALABILITY.md
- ✅ Customizar colores luxury → Editar CSS variables

**Pero para MVP**: Esta implementación es suficiente. 🚀
