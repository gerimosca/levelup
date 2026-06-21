# Comandos de Claude Agent

## ⚠️ Importante

Los archivos en esta carpeta son **REFERENCIAS**.

Los comandos reales de Claude están en: `/.claude/commands/`

Estos archivos `.txt` solo documentan:
- ✅ Qué comando existe
- ✅ Qué hace
- ✅ Qué scripts ejecuta internamente
- ✅ Cómo usarlo

---

## 🔄 Relación: Comandos → Scripts

**Los comandos de Claude son wrappers que ejecutan scripts:**

```
/generate-copies  →  Ejecuta internamente:
                      1. npm run i18n:create-structure
                      2. (opcional) npm run i18n:generate-ai
                      3. npm run i18n:validate

/validate-i18n    →  Ejecuta internamente:
                      1. npm run i18n:validate

/add-translation  →  Ejecuta internamente:
                      1. npm run i18n:create-structure (si no existe)
                      2. Edita archivos directamente
                      3. npm run i18n:validate
```

---

## 💡 ¿Por Qué Usar Comandos de Claude?

### Los comandos añaden:

- ✅ **Guía interactiva** - Te pregunta qué necesitas
- ✅ **Validación de inputs** - Verifica que todo esté correcto
- ✅ **Decisiones inteligentes** - Detecta si tienes meta-copies
- ✅ **Explicaciones claras** - Te muestra qué hizo y por qué
- ✅ **Sugerencias** - Te dice qué hacer después

### Los scripts directos son:

- ✅ **Independientes** - Funcionan sin Claude
- ✅ **Automatizables** - Perfectos para CI/CD
- ✅ **Precisos** - Control total de cada opción
- ✅ **Debuggeables** - Ves el output raw

---

## 📋 Comandos Disponibles

### 1. `/generate-copies`
**Propósito**: Generar estructura completa de copies para nueva página/componente

**Archivo de referencia**: `01-generate-copies.txt`

**Comando real en**: `/.claude/commands/generate-copies.md` (TO CREATE)

**Qué hace**:
1. Crea directorios y archivos `en.json` / `es.json`
2. Si detecta meta-copies, ofrece generar contenido con AI
3. Valida la estructura creada
4. Te muestra el namespace auto-detectado
5. Te sugiere siguiente paso

**Uso**:
```
/generate-copies --path=app/[locale]/(landing)/pricing
```

**Scripts que ejecuta**:
- `npm run i18n:create-structure`
- `npm run i18n:generate-ai` (opcional, si tienes meta-copies)
- `npm run i18n:validate`

---

### 2. `/validate-i18n`
**Propósito**: Validar todas las traducciones del proyecto

**Archivo de referencia**: `02-validate-translations.txt`

**Comando real en**: `/.claude/commands/validate-translations.md` (TO CREATE)

**Qué hace**:
1. Escanea todos los `**/copies/` directories
2. Verifica que existan EN y ES
3. Compara keys entre idiomas
4. Reporta errores de forma clara
5. Te sugiere cómo arreglarlos

**Uso**:
```
/validate-i18n
```

**Scripts que ejecuta**:
- `npm run i18n:validate`

---

### 3. `/sync-i18n`
**Propósito**: Sincronizar keys faltantes entre idiomas (EN ↔ ES)

**Archivo de referencia**: `03-sync-translation-keys.txt`

**Comando real en**: `/.claude/commands/sync-translations.md` (TO CREATE)

**Qué hace**:
1. Encuentra keys en un idioma que faltan en el otro
2. Añade keys faltantes con placeholder "[NEEDS TRANSLATION]"
3. Opcionalmente traduce con AI (--ai flag)
4. Muestra preview antes de aplicar cambios
5. Valida resultado final

**Uso**:
```
/sync-i18n                              # Sincronizar todo
/sync-i18n --path=app/[locale]/(auth)/login  # Path específico
/sync-i18n --ai                         # Con traducción AI
/sync-i18n --dry-run                    # Solo mostrar cambios
```

**Scripts que ejecuta**:
- `npm run i18n:sync-keys` (con diferentes flags)

---

## 🆚 Comandos vs Scripts: Comparación

| Aspecto | Comandos de Claude | Scripts Directos |
|---------|-------------------|------------------|
| **Facilidad** | ⭐⭐⭐⭐⭐ Muy fácil | ⭐⭐⭐ Requiere conocimiento |
| **Guía** | ✅ Te guía paso a paso | ❌ Debes saber qué hacer |
| **Validación** | ✅ Valida automáticamente | ❌ Debes validar manualmente |
| **Automatización** | ❌ No en CI/CD | ✅ Perfecto para CI/CD |
| **Flexibilidad** | ⭐⭐⭐ Opciones comunes | ⭐⭐⭐⭐⭐ Todas las opciones |
| **Debugging** | ⭐⭐ Menos visible | ⭐⭐⭐⭐⭐ Output completo |
| **Requiere Claude** | ✅ Sí | ❌ No |

---

## 📝 Ejemplos Prácticos

### Ejemplo 1: Crear Nueva Página

**Con Comando de Claude:**
```
/generate-copies --path=app/[locale]/(landing)/about
```

Claude te preguntará:
- "¿Tienes meta-copies para esta página?"
- "¿Quieres que genere el contenido automáticamente?"
- Te muestra el namespace detectado
- Te sugiere siguiente paso

**Con Scripts Directos:**
```bash
npm run i18n:create-structure -- --path=app/[locale]/(landing)/about
# Editas manualmente los archivos
npm run i18n:validate
```

### Ejemplo 2: Validar Antes de Commit

**Con Comando de Claude:**
```
/validate-i18n
```

Te muestra errores de forma visual y clara.

**Con Scripts Directos:**
```bash
npm run i18n:validate
```

Output raw con exit codes para CI.

---

## 🎯 ¿Cuándo Usar Cada Uno?

### Usa Comandos de Claude cuando:
- ✅ Eres nuevo en el proyecto
- ✅ No estás seguro de qué script ejecutar
- ✅ Quieres un workflow interactivo
- ✅ Prefieres que te guíen
- ✅ Haces esto ocasionalmente
- ✅ Estás desarrollando features

### Usa Scripts Directos cuando:
- ✅ Sabes exactamente qué necesitas
- ✅ Estás automatizando (CI/CD, hooks)
- ✅ Estás debugging un problema
- ✅ Quieres ver el output completo
- ✅ Haces esto frecuentemente
- ✅ Trabajas en scripts/automatización

---

## 🔧 Crear Nuevos Comandos

Si quieres añadir un nuevo comando de Claude:

1. **Crear archivo de referencia aquí**:
   ```bash
   touch scripts/i18n/agent/04-nuevo-comando.txt
   ```

2. **Documentar en el archivo**:
   - Propósito del comando
   - Qué scripts ejecuta
   - Cómo usarlo
   - Ejemplos

3. **Crear comando real en Claude**:
   ```bash
   touch .claude/commands/nuevo-comando.md
   ```

4. **Implementar lógica del comando**:
   - Validar inputs
   - Ejecutar scripts apropiados
   - Mostrar resultados
   - Sugerir siguiente paso

---

## 📚 Ver También

- `../00-START-HERE.md` - Quick start del sistema i18n
- `/../.claude/commands/` - Comandos reales de Claude
- `../generators/` - Scripts que ejecutan los comandos
- `../validation/` - Scripts de validación

---

**💡 Tip**: Si no tienes acceso a Claude Code, siempre puedes usar los scripts directos.
Los comandos de Claude son solo una interfaz más amigable sobre los mismos scripts.
