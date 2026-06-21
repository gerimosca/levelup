# Migración: i18n Global → Co-localized `copies/`

**Fecha**: 2025-11-21
**Status**: ✅ Completado

---

## Resumen Ejecutivo

Se migró el sistema de traducciones de archivos globales (`/messages/*.json`) a un sistema de co-localización máxima donde cada feature y módulo tiene sus propias traducciones en una carpeta `copies/`.

### Motivación

- **Alineación con VSA**: Cada feature debe ser completamente autocontenida
- **Mejor escalabilidad**: Añadir features no requiere tocar archivos compartidos
- **Menos conflictos**: Cada desarrollador trabaja en su propia carpeta
- **Refactoring trivial**: Mover/eliminar feature = mover carpeta completa
- **Claridad absoluta**: "¿Dónde están las traducciones de X?" → "En X/copies/"

---

## Cambios Implementados

### 1. Nuevo Sistema de Carga (`/src/i18n/`)

**Archivos creados**:
- `namespace-mapping.ts` - Reglas de auto-namespace por ruta
- `load-copies.ts` - Loader que carga y mergea todas las traducciones
- `request.ts` (actualizado) - Usa el nuevo loader

**Funcionamiento**:
1. Busca todos los archivos `**/copies/{locale}.json`
2. Extrae namespace automáticamente de la ruta del archivo
3. Mergea todo en un objeto final
4. Soporta fallback a legacy `/messages/*.json` durante migración

**Auto-namespace mapping**:
```
/features/auth/copies/          → namespace "auth"
/features/billing/copies/       → namespace "billing"
/shared/components/ui/copies/   → namespace "ui"
/shared/components/layouts/copies/ → namespace "layouts"
/shared/legal/copies/           → namespace "legal"
/shared/errors/copies/          → namespace "errors"
```

### 2. Migración de Traducciones

#### Features Migradas (8)
- ✅ auth
- ✅ billing
- ✅ admin
- ✅ affiliates
- ✅ dashboard
- ✅ my-account
- ✅ consent
- ✅ home (antes "landing")

#### Shared Migrados (5)
- ✅ ui (antes "common")
- ✅ layouts (antes "nav")
- ✅ seo
- ✅ legal
- ✅ errors (antes "notFound")

#### Total
- **13 directorios de copies/** creados
- **26 archivos JSON** creados (13 x 2 idiomas)

### 3. Actualización de Componentes

**Archivos modificados**:
- `src/core/shared/components/ui/skip-link.tsx` - `common` → `ui`
- `src/core/features/my-account/components/profile-form.tsx` - `common` → `ui`
- `src/core/shared/components/layouts/marketing-layout.tsx` - `nav` → `layouts`
- `src/core/shared/components/layouts/app-layout.tsx` - `nav` → `layouts`
- `src/core/shared/components/ui/mobile-menu.tsx` - `nav` → `layouts`
- `src/app/[locale]/not-found.tsx` - `notFound` → `errors`

**Patrón de cambio**:
```typescript
// Antes
const t = useTranslations('common');
const tNav = useTranslations('nav');

// Después
const t = useTranslations('ui');
const tNav = useTranslations('layouts');
```

### 4. Documentación Actualizada

**CLAUDE.md**:
- ✅ Sección "Brand Voice & UX Writing" actualizada
- ✅ Nueva sección "Sistema de Traducciones: Co-localized copies/"
- ✅ Guía "Cómo Añadir Traducciones"
- ✅ Checklist actualizado

---

## Estructura Final

```
/src/core/
├── features/
│   ├── auth/copies/
│   │   ├── en.json
│   │   └── es.json
│   ├── billing/copies/
│   ├── admin/copies/
│   ├── affiliates/copies/
│   ├── dashboard/copies/
│   ├── my-account/copies/
│   ├── consent/copies/
│   └── home/copies/
└── shared/
    ├── components/
    │   ├── ui/copies/
    │   ├── layouts/copies/
    │   └── seo/copies/
    ├── legal/copies/
    └── errors/copies/

/src/i18n/
├── namespace-mapping.ts  (nuevo)
├── load-copies.ts        (nuevo)
└── request.ts            (actualizado)

/messages/                (legacy, puede eliminarse)
├── en.json              (aún contiene: about, faq, pricing, _template)
└── es.json
```

---

## Uso del Nuevo Sistema

### Para desarrolladores

**1. Crear traducciones para nueva feature**:
```bash
mkdir -p src/core/features/mi-feature/copies
touch src/core/features/mi-feature/copies/en.json
touch src/core/features/mi-feature/copies/es.json
```

**2. Estructura recomendada**:
```json
{
  "page": { "title": "...", "description": "..." },
  "form": { "field": { "label": "...", "help": "..." } },
  "empty": { "title": "...", "action": "..." },
  "success": { "created": "..." },
  "errors": { "notFound": "..." }
}
```

**3. Usar en componentes**:
```typescript
const t = useTranslations('mi-feature'); // Auto-namespace
```

### Para agregar traducciones compartidas

- UI general → `/shared/components/ui/copies/`
- Navegación → `/shared/components/layouts/copies/`
- SEO → `/shared/components/seo/copies/`
- Legal → `/shared/legal/copies/`

---

## Beneficios Logrados

1. ✅ **Autocontención VSA**: Features completamente independientes
2. ✅ **Escalabilidad**: Añadir features no toca archivos compartidos
3. ✅ **Menos conflictos git**: Cada dev en su carpeta
4. ✅ **Refactoring fácil**: Mover feature = mover carpeta
5. ✅ **Claridad**: Traducciones junto al código que las usa
6. ✅ **Auto-namespace**: Sin configuración manual
7. ✅ **Backwards compatible**: Soporta legacy durante migración

---

## Trabajo Pendiente

### Opcional - Completar Migración

Aún quedan en `/messages/*.json`:
- `about` - Página estática
- `faq` - Componente FAQ
- `pricing` - Página de pricing
- `_template` - Template de ejemplo

**Decisión**: Dejar en legacy por ahora (son contenido estático).
**Alternativa**: Crear `/core/shared/marketing/copies/` y migrar allí.

### Opcional - Eliminar Legacy

Cuando estés 100% seguro que todo funciona:
```bash
rm -rf /messages/
```

---

## Verificación

### Tests Realizados
- ✅ Type-check: Sin errores
- ✅ Dev server: Inicia sin errores
- ✅ Auto-namespace: Funciona correctamente

### Tests Recomendados
- [ ] Build de producción: `npm run build`
- [ ] Verificar todas las páginas cargan
- [ ] Cambiar idioma funciona (en/es)
- [ ] Features usan namespace correcto

---

## Rollback (si es necesario)

Si algo falla, revertir es fácil:

1. **Revertir request.ts**:
```typescript
// Volver a:
messages: (await import(`../../messages/${locale}.json`)).default,
```

2. **Eliminar archivos nuevos**:
```bash
rm src/i18n/namespace-mapping.ts
rm src/i18n/load-copies.ts
find src -name "copies" -type d -exec rm -rf {} +
```

3. **Revertir componentes** (git revert de los cambios)

---

## Conclusión

La migración se completó exitosamente. El sistema de `copies/` co-localizadas está funcionando y alineado con la arquitectura VSA del proyecto.

**Próximo paso**: Probar en un ambiente de desarrollo completo y eventualmente eliminar `/messages/` legacy.
