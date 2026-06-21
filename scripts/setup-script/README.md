# Interactive Setup System

Sistema de setup interactivo y modular con menús jerárquicos, tracking de progreso, y verificación automática.

## 🎯 Características

- **Menú interactivo jerárquico**: Navega por categorías y pasos
- **Tracking persistente**: Estado guardado en `.setup.json`
- **Verificación automática**: Auto-detecta qué está configurado
- **Pasos manuales con marcado**: Marca pasos manuales como completados
- **Reportes exportables**: Genera reportes en Markdown
- **Integración con scripts legacy**: Reutiliza scripts existentes

## 🚀 Uso Rápido

```bash
# Setup interactivo completo
npm run setup

# Verificar estado del setup
npm run setup:verify

# Exportar reporte
npm run setup:export

# Reset completo (elimina progreso)
npm run setup:reset

# Scripts legacy (modo original)
npm run setup:legacy
npm run setup:db
npm run setup:seo
```

## 📊 Estructura del Sistema

```
/scripts/setup-script/
├── index.mjs              # Entry point principal
├── lib/
│   ├── state.mjs          # Sistema de estado (.setup.json)
│   ├── menu.mjs           # Menús interactivos
│   ├── verification.mjs   # Verificación automática
│   ├── categories.mjs     # Loader de categorías
│   ├── utils.mjs          # Utilidades
│   └── report.mjs         # Generación de reportes
└── categories/
    ├── infrastructure.mjs # Categoría: Infrastructure
    ├── database.mjs       # Categoría: Database
    ├── branding.mjs       # Categoría: Branding & Design
    ├── content.mjs        # Categoría: Content & SEO
    ├── integrations.mjs   # Categoría: Integrations
    └── compliance.mjs     # Categoría: Legal & Compliance
```

## 📁 Archivo de Estado: `.setup.json`

El progreso se guarda automáticamente en `.setup.json` en la raíz del proyecto:

```json
{
  "version": "1.0.0",
  "createdAt": "2025-11-20T10:00:00Z",
  "lastRun": "2025-11-20T15:30:00Z",
  "progress": {
    "total": 18,
    "completed": 8,
    "pending": 7,
    "skipped": 2,
    "failed": 1
  },
  "categories": {
    "infrastructure": {
      "status": "completed",
      "completedSteps": 4,
      "totalSteps": 4,
      "steps": {
        "check-node": {
          "status": "completed",
          "timestamp": "2025-11-20T10:05:00Z"
        }
      }
    }
  },
  "readyForProduction": false,
  "criticalMissing": ["stripe-products"]
}
```

## 🎨 Categorías Disponibles

### 1. Infrastructure Setup (Crítico)
- Check Node.js v20+
- Install Supabase CLI
- Install Stripe CLI (opcional)
- Install dependencies
- Configure environment variables

### 2. Database Setup (Crítico)
- Link Supabase project
- Apply migrations
- Generate TypeScript types

### 3. Branding & Design (Recomendado)
- Brand configuration (AI-assisted)
- Color palette (AI-assisted)
- Logo, favicon, OG images

### 4. Content & SEO (Recomendado)
- Customize landing page (AI-assisted)
- Generate SEO pages (AI-assisted)
- Review translations

### 5. Integrations (Mixto)
- **Create Stripe products** (Manual, Crítico)
- **Create Stripe pricing table** (Manual, Crítico)
- Configure Stripe webhooks
- Configure email provider (Resend)
- **Copy email templates to Supabase** (Manual)
- Configure Sentry (opcional)

### 6. Compliance (Crítico para producción)
- Customize legal pages
- **GDPR compliance (Iubenda)** (Manual)

## 🎮 Flujo de Navegación

### Menú Principal
```
┌──────────────────────────────────────────────────────┐
│  🚀 SaaS Boilerplate - Interactive Setup             │
│  ───────────────────────────────────────────────────│
│                                                      │
│  1. ✅ Infrastructure          [4/4]  🔴 Critical   │
│  2. ✅ Database                [3/3]  🔴 Critical   │
│  3. ⚠️  Branding & Design      [1/3]  🟡 Recommended│
│  4. ⏸️  Content & SEO          [0/3]  🟡 Recommended│
│  5. ⚠️  Integrations           [2/6]  🔵 Mixed      │
│  6. ⏸️  Compliance             [0/2]  🟠 Critical   │
│                                                      │
│  Overall Progress: ████████░░░░░░ 50% (10/20)       │
│                                                      │
│  [v] Verify & Diagnose    [r] Run Full Wizard       │
│  [e] Export Report        [q] Quit                  │
│                                                      │
│  → Select category (1-6) or action (v/r/e/q):        │
└──────────────────────────────────────────────────────┘
```

### Menú de Categoría
- Lista todos los pasos con estado
- Opciones:
  - `1-N`: Seleccionar paso específico
  - `a`: Ejecutar todos los pasos pending
  - `v`: Verificar todos los pasos
  - `b`: Volver al menú principal

### Menú de Paso Individual

**Para pasos automatizados:**
- `x`: Ejecutar paso
- `v`: Verificar estado
- `s`: Saltar paso
- `r`: Re-ejecutar (si ya completado)

**Para pasos manuales:**
- `c`: Marcar como completado
- `u`: Desmarcar
- `s`: Saltar paso
- `1-N`: Abrir links de ayuda

## 🔍 Verificación Automática

El sistema verifica automáticamente:

```javascript
// Infrastructure
✅ Node.js v20+
✅ Supabase CLI installed
✅ Dependencies installed
✅ .env.local configured

// Database
✅ Supabase project linked
✅ Migrations applied
✅ Types generated

// Branding
✅ Brand config customized
✅ Custom colors set
✅ Assets uploaded

// And more...
```

## 📤 Exportar Reporte

```bash
npm run setup:export
```

Genera `setup-report.md` con:
- Overall progress
- Critical missing items
- Recommendations
- Breakdown por categoría
- Next steps sugeridos

## 🔧 Añadir Nuevo Paso

### 1. Edita la categoría correspondiente

```javascript
// scripts/setup-script/categories/infrastructure.mjs

export default {
  id: 'infrastructure',
  name: 'Infrastructure Setup',
  steps: [
    // ... pasos existentes
    {
      id: 'my-new-step',
      name: 'My New Step',
      description: 'What this step does',
      type: 'automated', // or 'manual'
      required: true,
      verification: 'my-new-step', // nombre del verificador
      action: async () => {
        // Implementar acción
        const result = runCommand('npm install something');
        return {
          success: result.success,
          message: 'Step completed'
        };
      }
    }
  ]
};
```

### 2. Añade verificador (si es automatizado)

```javascript
// scripts/setup-script/lib/verification.mjs

export function verifyMyNewStep() {
  const passed = /* lógica de verificación */;
  return {
    passed,
    message: passed ? 'Step configured ✓' : 'Step not configured'
  };
}

// Añadir a verifyStep()
const verifiers = {
  // ... existentes
  'my-new-step': verifyMyNewStep,
};
```

### 3. Para pasos manuales

```javascript
{
  id: 'manual-step',
  name: 'Manual Configuration',
  type: 'manual',
  required: false,
  instructions: [
    '1. Go to Dashboard',
    '2. Click Settings',
    '3. Configure X'
  ],
  links: [
    {
      label: 'Open Dashboard',
      url: 'https://dashboard.example.com'
    }
  ]
}
```

## 🎯 Best Practices

### Pasos Automatizados
- ✅ Siempre proveer función de verificación
- ✅ Retornar `{ success, message }` desde action
- ✅ Manejar errores gracefully
- ✅ Dar feedback claro al usuario

### Pasos Manuales
- ✅ Instrucciones claras y numeradas
- ✅ Proveer links directos
- ✅ Explicar el "por qué"
- ✅ Indicar si es opcional o crítico

### Categorías
- ✅ Agrupar pasos relacionados
- ✅ Definir prioridad correcta
- ✅ Descripción concisa pero clara

## 🐛 Troubleshooting

### "Setup state corrupted"
```bash
npm run setup:reset
```

### "Verification not detecting completed step"
1. Verifica que el verificador esté implementado correctamente
2. Ejecuta `npm run setup:verify` para forzar re-verificación
3. Marca manualmente si es necesario

### "Step failed but should have worked"
1. Re-ejecuta el paso desde el menú interactivo
2. Verifica logs de error
3. Ejecuta el script legacy directamente si disponible

## 📚 Referencia de Estados

| Estado | Descripción | Icono |
|--------|-------------|-------|
| `completed` | Paso completado | ✅ |
| `pending` | No iniciado | ⏸️ |
| `failed` | Falló durante ejecución | ❌ |
| `skipped` | Saltado por usuario | ⏭️ |
| `partial` | Algunos pasos completados | ⚠️ |

## 🚦 Prioridades

| Prioridad | Descripción | Icono |
|-----------|-------------|-------|
| `critical` | Bloqueador para desarrollo | 🔴 |
| `critical-for-production` | Bloqueador para producción | 🟠 |
| `recommended` | Recomendado | 🟡 |
| `optional` | Nice to have | ⚪ |
| `mixed` | Combinación | 🔵 |

## 🔄 Migración desde Setup Legacy

El setup interactivo reusa los scripts legacy cuando es posible:

```javascript
// Ejemplo: brand config
action: async () => {
  const result = runCommand('node scripts/setup.mjs --brand-only');
  return { success: result.success, message: '...' };
}
```

Puedes ejecutar el setup legacy en cualquier momento:
```bash
npm run setup:legacy
```

## 💡 Tips

1. **Usa `[v] Verify`** regularmente para auto-detectar progreso
2. **Exporta reportes** antes de compartir estado con equipo
3. **Marca pasos manuales** después de completarlos
4. **Skip pasos opcionales** que no necesites
5. **Re-ejecuta pasos** si cambiaste configuración

## 🎓 Ejemplos de Uso

### Setup completo desde cero
```bash
npm run setup
# Navega por categorías
# Ejecuta pasos uno por uno o usa "Run all"
```

### Solo verificar qué falta
```bash
npm run setup:verify
```

### Completar solo integraciones
```bash
npm run setup
# Selecciona "5" (Integrations)
# Ejecuta pasos pendientes
```

### Generar reporte para el equipo
```bash
npm run setup:export
# Comparte setup-report.md
```

---

**Creado por:** Setup Script System v1.0.0
**Documentación completa:** [CLAUDE.md](/CLAUDE.md)
