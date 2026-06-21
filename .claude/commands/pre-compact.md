Antes de compactar la sesión, evalúa qué aprendizajes deberían guardarse en la documentación.

## Checklist de Evaluación

### 1. Patrones Nuevos
¿Descubriste patrones de código que no están documentados en CLAUDE.md principal?
- Nuevas convenciones de nombres
- Patrones de componentes
- Patrones de manejo de errores
- Formas de hacer las cosas que funcionaron bien

**Si sí** → Añadir a la sección correspondiente en `/CLAUDE.md`

### 2. Decisiones de Arquitectura
¿Tomaste decisiones importantes sobre cómo implementar algo?
- Por qué elegiste una aproximación sobre otra
- Trade-offs considerados
- Limitaciones encontradas

**Si sí** → Añadir a "Decisiones de Arquitectura" en el CLAUDE.md de la feature

### 3. Deuda Técnica
¿Introdujiste deuda técnica conscientemente?
- Shortcuts tomados por tiempo
- Cosas que deberían refactorizarse
- TODOs pendientes

**Si sí** → Documentar en "Deuda Técnica" del CLAUDE.md de la feature

### 4. Errores Comunes / Troubleshooting
¿Encontraste errores difíciles de debuggear?
- Mensajes de error crípticos
- Problemas de configuración
- Gotchas o edge cases

**Si sí** → Añadir a "Troubleshooting" o "Notas" en el CLAUDE.md correspondiente

### 5. Casos de Testing
¿Identificaste casos de prueba que deberían existir?
- Casos críticos no cubiertos
- Edge cases encontrados
- Flujos que deberían testearse

**Si sí** → Añadir a "Testing" en el CLAUDE.md de la feature

### 6. Comandos Repetitivos
¿Hiciste alguna tarea repetitiva múltiples veces?
- Secuencias de comandos
- Búsquedas frecuentes
- Patrones de edición

**Si sí** → Sugerir nuevo slash command en `/.claude/commands/`

### 7. Context Perdido
¿Hay información que sería útil en la próxima sesión?
- Estado actual de una implementación en progreso
- Próximos pasos planificados
- Dependencias o bloqueos

**Si sí** → Añadir a "Notas" en el CLAUDE.md de la feature relevante

## Proceso

1. Revisar cada punto del checklist
2. Para cada "sí", hacer el update correspondiente
3. Confirmar que los cambios se guardaron
4. Proceder con el compact

## Output

Listar:
- Archivos actualizados
- Información añadida a cada uno
- Sugerencias para la próxima sesión
