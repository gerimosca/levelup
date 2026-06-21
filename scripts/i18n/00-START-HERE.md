# Sistema de Traducciones i18n

## 🎯 Punto de Entrada - Empieza Aquí

Este sistema gestiona las traducciones de tu aplicación de forma automatizada usando:

- **Meta-copies**: Instrucciones/prompts de qué texto necesitas (en `core/features/*/meta-copies/`)
- **Copies finales**: Traducciones reales en EN/ES (en `app/[locale]/*/copies/`)
- **Claude API**: Genera contenido automáticamente desde meta-copies
- **Validación**: Asegura que EN y ES estén sincronizados

---

## 🚀 Cómo Usar el Sistema

### Opción A: Comandos de Claude (Recomendado - Más Fácil)

Claude Code te guía paso a paso:

```
/generate-copies --path=app/[locale]/(landing)/pricing
```

**Ver**: `agent/` para lista completa de comandos disponibles

### Opción B: Scripts Directos (Avanzado - Más Control)

Ejecutas cada paso manualmente:

```bash
# Paso 1: Crear estructura vacía
npm run i18n:create-structure -- --path=app/[locale]/(landing)/pricing

# Paso 2: (Opcional) Generar contenido con AI
npm run i18n:generate-ai -- \
  --source=core/features/home/meta-copies \
  --target=app/[locale]/(landing)/pricing

# Paso 3: Validar que todo esté correcto
npm run i18n:validate
```

### Opción C: Automatización/CI

Los scripts funcionan sin Claude Code:

```bash
npm run i18n:validate  # En pre-commit hook
npm run i18n:sync-keys # En cron job para mantener sincronizado
```

---

## 📋 Flujo Típico

### Escenario: Crear Nueva Página de Pricing

```
1. Crear directorio
   mkdir -p app/[locale]/(landing)/pricing

2. Generar estructura de traducciones
   /generate-copies --path=app/[locale]/(landing)/pricing

   O directamente:
   npm run i18n:create-structure -- --path=app/[locale]/(landing)/pricing

3. (Opcional) Si tienes meta-copies, generar contenido
   npm run i18n:generate-ai -- \
     --source=core/features/home/meta-copies \
     --target=app/[locale]/(landing)/pricing

4. Editar traducciones (si generaste con AI, revisar y ajustar)
   - Editar: app/[locale]/(landing)/pricing/copies/en.json
   - Editar: app/[locale]/(landing)/pricing/copies/es.json

5. Validar
   npm run i18n:validate

6. Usar en componentes
   const t = useTranslations('pricing');
   t('hero.title')
```

---

## 📁 Estructura del Sistema

```
/scripts/i18n/
├── 00-START-HERE.md          ← ESTE ARCHIVO
├── agent/                     ← Referencias a comandos de Claude
│   ├── README.md              (Explica relación comandos/scripts)
│   ├── 01-generate-copies.txt
│   ├── 02-validate-i18n.txt
│   └── 03-add-translation-keys.txt
│
├── generators/                ← Scripts que crean/generan
│   ├── step-1-create-translation-structure.mjs  (Crea archivos vacíos)
│   ├── step-2-generate-content-with-ai.mjs      (Genera con Claude API)
│   └── step-3-sync-missing-keys.mjs             (Sincroniza EN↔ES)
│
├── validation/                ← Scripts que validan
│   └── validate-all-translations.mjs
│
└── lib/                       ← Utilidades compartidas
    ├── error-handler.mjs
    ├── anthropic-client.mjs
    ├── namespace-detector.mjs
    └── brand-loader.mjs
```

---

## 🎯 ¿Cuándo Usar Qué?

| Situación | Usar |
|-----------|------|
| 🆕 Soy nuevo en el proyecto | Comandos de Claude (`/generate-copies`) |
| 🤖 Quiero que AI genere el contenido | Comandos de Claude o `npm run i18n:generate-ai` |
| ✏️ Prefiero escribir manualmente | `npm run i18n:create-structure` + editar archivos |
| 🔧 Automatización/CI/CD | Scripts directos (`npm run i18n:*`) |
| 🐛 Debugging | Scripts directos con `--help` |
| ✅ Verificar antes de commit | `npm run i18n:validate` |

---

## 🔄 Relación: Claude Code ↔ Scripts

**IMPORTANTE**: Los comandos de Claude **ejecutan** los scripts.

```
Usuario → /generate-copies → Claude Code → npm run i18n:create-structure
                                        → npm run i18n:validate
```

- **Comandos de Claude** = Interfaz amigable que ejecuta scripts + te guía
- **Scripts npm** = Herramientas independientes que funcionan sin Claude

**Ver `agent/README.md` para más detalles**

---

## 📖 Documentación Completa

Este README es un quick start. Para más detalles:

- `agent/README.md` - Relación comandos/scripts
- `ARCHITECTURE.md` - Cómo funciona internamente (TO DO)
- `DEVELOPER-GUIDE.md` - Ejemplos paso a paso (TO DO)
- `PROCESS-FLOW.md` - Flujo completo con diagramas (TO DO)

---

## 🛠️ Scripts Disponibles

| Script | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| `i18n:create-structure` | Crea archivos vacíos en.json/es.json | Siempre (paso 1) |
| `i18n:generate-ai` | Genera contenido con Claude API | Si tienes meta-copies |
| `i18n:sync-keys` | Sincroniza keys faltantes EN↔ES | Mantenimiento |
| `i18n:validate` | Valida todas las traducciones | Antes de commit |

---

## ⚠️ Requisitos

### Para Crear Estructura (step-1)
- ✅ Node.js >= 20.9.0
- ✅ Directorio de destino debe existir

### Para Generar con AI (step-2)
- ✅ Todo lo anterior
- ✅ Variable de entorno: `ANTHROPIC_API_KEY`
- ✅ Meta-copies existentes en `core/features/*/meta-copies/`

### Para Validar
- ✅ Node.js >= 20.9.0
- ✅ Al menos una carpeta `copies/` con traducciones

---

## 🆘 Ayuda Rápida

```bash
# Ver ayuda de un script
npm run i18n:create-structure -- --help
npm run i18n:validate -- --help

# Ver comandos de Claude disponibles
ls -la scripts/i18n/agent/

# Validar todo el proyecto
npm run i18n:validate

# Crear estructura para una nueva página
npm run i18n:create-structure -- --path=app/[locale]/(landing)/nueva-pagina
```

---

## 🎓 Siguiente Paso

1. **Si quieres usar Claude Code**: Ve a `agent/` para ver comandos disponibles
2. **Si quieres usar scripts directos**: Ejecuta `npm run i18n:create-structure -- --help`
3. **Si quieres entender el sistema**: Lee `ARCHITECTURE.md` (próximamente)
4. **Si quieres ver ejemplos**: Lee `DEVELOPER-GUIDE.md` (próximamente)

**¡Empieza creando tu primera traducción!** 🚀
