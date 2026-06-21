Realiza una auditoría completa del proyecto y de la configuración de Claude Code.

## 1. Auditoría del Código

### TypeScript
```bash
npm run type-check
```
- [ ] 0 errores de TypeScript
- [ ] Reportar cualquier error encontrado

### Linting
```bash
npm run lint
```
- [ ] 0 errores de lint
- [ ] Reportar warnings importantes

### Imports Cross-Feature
Buscar imports prohibidos:
```bash
grep -r "from '@/features/" src/features/ --include="*.ts" --include="*.tsx" | grep -v "from '@/features/[^/]*'"
```
- [ ] No hay imports entre features

### Estructura CQRS
Para cada feature en `/src/features/`, verificar:
- [ ] Tiene types/index.ts
- [ ] Tiene [feature].query.ts
- [ ] Tiene [feature].command.ts
- [ ] Tiene [feature].handler.ts
- [ ] Tiene [feature].actions.ts

---

## 2. Auditoría de Base de Datos

### RLS Habilitado
Revisar migraciones en `/supabase/migrations/`:
- [ ] Todas las tablas tienen `ENABLE ROW LEVEL SECURITY`
- [ ] Todas tienen política para usuarios
- [ ] Todas tienen política para service_role

### Foreign Keys
- [ ] Referencias a auth.users tienen `ON DELETE CASCADE`
- [ ] Timestamps tienen defaults y triggers

---

## 3. Auditoría de Traducciones

### Sincronización
Comparar keys entre:
- `messages/en.json`
- `messages/es.json`

- [ ] Mismas keys en ambos archivos
- [ ] No hay keys huérfanas

### Cobertura
- [ ] Todas las features tienen namespace de traducciones
- [ ] No hay textos hardcodeados en componentes

---

## 4. Auditoría de Seguridad

### Environment Variables
- [ ] No hay secrets en código
- [ ] .env tiene todas las variables necesarias

### Server Actions
- [ ] Todas verifican autenticación con getUser()
- [ ] No exponen datos sensibles

---

## 5. Auditoría de Claude Code Config

### CLAUDE.md
- [ ] Lista de features está actualizada
- [ ] Patrones de código son correctos
- [ ] Comandos documentados existen

### Commands
Para cada command en `/.claude/commands/`:
- [ ] Instrucciones son claras y completas
- [ ] Sigue patrones del proyecto

### Permisos
En `/.claude/settings.local.json`:
- [ ] Comandos frecuentes tienen permiso
- [ ] No hay permisos innecesarios

---

## 6. Reporte Final

### Formato del reporte:

```
# Auditoría del Proyecto - [Fecha]

## Resumen
- Total checks: X
- Pasados: X ✅
- Warnings: X ⚠️
- Errores: X ❌

## Errores Críticos ❌
[Lista de errores que requieren atención inmediata]

## Warnings ⚠️
[Lista de mejoras sugeridas]

## Checks Pasados ✅
[Lista resumida de lo que está bien]

## Acciones Recomendadas
1. [Acción prioritaria 1]
2. [Acción prioritaria 2]
...

## Sugerencias para Claude Code Config
[Si hay mejoras para CLAUDE.md o commands, detallarlas aquí]
```

---

## Frecuencia Recomendada

- **Después de cada feature nueva**: Verificar integración
- **Semanalmente**: Auditoría completa
- **Antes de deploy**: Verificación final

---

## Notas

- Si encuentras patrones nuevos no documentados en CLAUDE.md, proponerlos
- Si hay tareas repetitivas, sugerir nuevo command
- Mantener la configuración sincronizada con el proyecto
