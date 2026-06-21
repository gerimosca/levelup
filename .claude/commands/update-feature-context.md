Actualiza el CLAUDE.md de la feature "$ARGUMENTS" con el estado actual del código.

## Proceso:

### 1. Localizar la feature
Buscar en `/src/features/$ARGUMENTS/`

### 2. Analizar el código actual
- Revisar types/index.ts para entender la estructura de datos
- Revisar actions para entender funcionalidades
- Revisar componentes para entender UI
- Identificar dependencias (tablas, APIs)

### 3. Leer CLAUDE.md existente (si existe)
Si no existe, crearlo con el template base.

### 4. Actualizar secciones

**Propósito**:
- Verificar que sigue siendo preciso
- Actualizar si el alcance cambió

**Decisiones de Arquitectura**:
- Añadir nuevas decisiones tomadas
- NO eliminar decisiones anteriores (son historial)
- Formato: `- [Decisión]: [Razón] (fecha opcional)`

**Dependencias**:
- Actualizar lista de tablas usadas
- Actualizar APIs externas

**Testing - Casos críticos**:
- Añadir casos para nueva funcionalidad
- Marcar con ✅ los casos que tienen tests
- Mantener casos existentes

**Deuda Técnica**:
- Añadir nueva deuda detectada con descripción
- Marcar deuda resuelta: `- ✅ [Descripción] (resuelto [fecha])`
- Referenciar issues de GitHub si existen

**Notas**:
- Añadir contexto importante descubierto
- Advertencias para futuros desarrolladores
- Gotchas o edge cases

### 5. Formato del CLAUDE.md

```markdown
# Feature: [Nombre]

## Propósito
[Descripción clara y concisa]

## Decisiones de Arquitectura
- [Decisión]: [Razón]

## Dependencias
- **Tables**: lista
- **APIs externas**: lista o "ninguna"

## Testing

### Casos críticos
- [ ] Caso pendiente de test
- [x] Caso con test

### Ejecutar tests
\`\`\`bash
npm run test -- features/[nombre]
\`\`\`

## Deuda Técnica
- [ ] Descripción de deuda pendiente
- [x] Deuda resuelta (fecha)

## Notas
Contexto importante...
```

### 6. Verificar consistencia
- El CLAUDE.md refleja el código actual
- No hay información obsoleta
- Los casos de testing cubren la funcionalidad

## Cuándo usar este comando

- Después de añadir funcionalidad significativa
- Después de refactorizar
- Al resolver deuda técnica
- Al descubrir contexto importante
- Periódicamente durante `/audit`
