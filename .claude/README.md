# Claude Code Configuration

Este proyecto incluye una configuración optimizada de Claude Code para maximizar la eficiencia del desarrollo.

## Qué es esto

Claude Code es el CLI oficial de Anthropic para Claude. Esta configuración incluye:
- **CLAUDE.md** principal con contexto del proyecto
- **CLAUDE.md por feature** con contexto específico
- **Slash commands** para tareas comunes
- **Skills** con guías de implementación
- **Permisos** pre-configurados

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/new-feature [nombre]` | Crear feature completa (VSA + CQRS) |
| `/add-action [nombre]` | Añadir Server Action a feature existente |
| `/fix-types` | Corregir errores de TypeScript |
| `/add-translation [keys]` | Añadir traducciones en/es |
| `/review-feature [nombre]` | Revisar feature contra estándares |
| `/audit` | Auditoría completa del proyecto |
| `/update-feature-context [nombre]` | Actualizar CLAUDE.md de feature |
| `/pre-compact` | Evaluar qué guardar antes de compactar sesión |

## Estructura

```
/.claude/
├── README.md                    # Esta documentación
├── settings.local.json          # Permisos de comandos
├── commands/                    # Slash commands
│   ├── new-feature.md
│   ├── add-action.md
│   ├── fix-types.md
│   ├── add-translation.md
│   ├── review-feature.md
│   ├── audit.md
│   ├── update-feature-context.md
│   └── pre-compact.md
└── skills/                      # Guías de implementación
    ├── feature.md
    ├── migration.md
    └── component.md
```

## CLAUDE.md por Feature

Cada feature tiene su propio `CLAUDE.md` que Claude carga automáticamente al trabajar en esa feature:

```
/src/features/[nombre]/CLAUDE.md
```

### Contenido

- **Propósito**: Qué hace la feature
- **Decisiones de Arquitectura**: Por qué se hizo así
- **Dependencias**: Tablas, APIs externas
- **Testing**: Casos críticos y cómo testear
- **Deuda Técnica**: Issues conocidos
- **Notas**: Contexto importante

### Beneficio

Claude tiene contexto específico de cada feature sin necesidad de explorar el código. Esto acelera significativamente el desarrollo.

## Flujo de Trabajo

### Antes de cada tarea
Claude lee automáticamente:
1. `/CLAUDE.md` principal
2. `CLAUDE.md` de las features afectadas

### Durante la ejecución
- Documenta decisiones arquitectónicas
- Registra deuda técnica introducida

### Después de cada tarea
- Actualiza CLAUDE.md si hay nuevo contexto
- Verifica casos de testing
- Ejecuta tests si es posible

### Periódicamente
Ejecutar `/audit` para:
- Verificar código y configuración
- Detectar patrones no documentados
- Sugerir mejoras

### Antes de compactar sesión
Ejecutar `/pre-compact` para:
- Guardar aprendizajes en la documentación
- No perder contexto valioso

## Skills

Los skills son guías detalladas de implementación:

- **feature.md**: Crear feature completa paso a paso
- **migration.md**: Crear migraciones SQL para Supabase
- **component.md**: Crear componentes React con forms
- **seo-landing.md**: Crear landing pages SEO-optimizadas para features

## Setup Scripts

| Script | Descripción |
|--------|-------------|
| `npm run setup` | Configuración inicial (env, brand, Stripe) |
| `npm run setup:db` | Link Supabase y push migrations |
| `npm run setup:seo` | Crear landing pages SEO (use cases, alternative) |

### setup:seo

Crea un conjunto de landing pages SEO fundamentales usando Claude para generar contenido:

1. **Use Case Pages** (`/for/[persona]`)
   - Páginas para cada persona objetivo (startups, agencies, etc.)
   - Pain points específicos y solución

2. **Alternative Page** (`/alternative/[competitor]`)
   - Comparación con competidor principal
   - Tabla de características
   - Razones para cambiar

```bash
npm run setup:seo
# Pregunta por:
# - Descripción del negocio
# - Personas objetivo (3-5)
# - Competidor principal
```

## MCP Servers

El proyecto incluye MCP (Model Context Protocol) servers para acceder a herramientas externas:

### Configurados (`.mcp.json`)

| Server | Descripción | Uso |
|--------|-------------|-----|
| **magicui** | Componentes animados Magic UI | `mcp__magicui__*` |
| **context7** | Documentación de librerías | `mcp__context7__*` |

### Magic UI

Acceso a componentes animados de [magicui.design](https://magicui.design). Usar cuando necesites:
- Animaciones de texto
- Efectos visuales
- Componentes decorativos

### Context7

Acceso a documentación actualizada de librerías. Usar para:
- Consultar docs de Next.js, React, etc.
- Obtener ejemplos de código actualizados
- Evitar información desactualizada

### Añadir nuevo MCP

Editar `/.mcp.json`:

```json
{
  "mcpServers": {
    "nuevo-server": {
      "command": "npx",
      "args": ["-y", "@package/mcp"]
    }
  }
}
```

Añadir permisos en `/.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": ["mcp__nuevo-server__*"]
  }
}
```

## Permisos

Los siguientes comandos están pre-autorizados en `settings.local.json`:

```
npm run dev/build/test/lint/type-check
npm run generate:slice
npx supabase/*
npx shadcn/*
npx tsc/*
mcp__magicui__*
mcp__context7__*
```

## Uso

### Para desarrolladores

1. Clona el proyecto
2. Abre con Claude Code
3. Claude tendrá todo el contexto automáticamente
4. Usa los slash commands para tareas comunes

### Crear nueva feature

```bash
/new-feature projects
```

Claude creará:
- Estructura de archivos (query, command, handler, actions)
- Migración SQL con RLS
- Tipos Zod
- Componentes
- Traducciones
- CLAUDE.md de la feature

### Mantener actualizado

Después de cambios significativos:

```bash
/update-feature-context [nombre]
```

## Diferencia entre README.md y CLAUDE.md

| README.md | CLAUDE.md |
|-----------|-----------|
| Para humanos | Para Claude (contexto automático) |
| Documentación de uso | Contexto de desarrollo |
| Setup, API pública | Decisiones, deuda, testing |

Claude puede consultar README.md cuando necesite info de setup o uso, pero CLAUDE.md se carga automáticamente.

## Personalización

### Añadir nuevo comando

Crear archivo en `/.claude/commands/[nombre].md` con:
- Descripción de qué hace
- Pasos a ejecutar
- Usar `$ARGUMENTS` para parámetros

### Añadir nuevo skill

Crear archivo en `/.claude/skills/[nombre].md` con:
- Guía paso a paso
- Templates de código
- Ejemplos

### Modificar permisos

Editar `/.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": ["Bash(comando:*)"]
  }
}
```

## Más información

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [CLAUDE.md principal](/CLAUDE.md)
