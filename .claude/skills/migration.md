# Skill: Crear Migración Supabase

Guía para crear migraciones SQL correctas para Supabase.

## Crear Archivo de Migración

```bash
npx supabase migration new [nombre_descriptivo]
```

Esto crea: `supabase/migrations/[timestamp]_[nombre].sql`

## Template de Tabla Nueva

```sql
-- ============================================
-- Tabla: [nombre]s
-- Descripción: [descripción breve]
-- ============================================

-- Crear tabla
CREATE TABLE [nombre]s (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign key a usuario
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Campos de la entidad
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE [nombre]s ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados
CREATE POLICY "Users can view own [nombre]s"
  ON [nombre]s FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own [nombre]s"
  ON [nombre]s FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own [nombre]s"
  ON [nombre]s FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own [nombre]s"
  ON [nombre]s FOR DELETE
  USING (auth.uid() = user_id);

-- O política combinada para todas las operaciones:
-- CREATE POLICY "Users can manage own [nombre]s"
--   ON [nombre]s FOR ALL
--   USING (auth.uid() = user_id);

-- Política para service role (webhooks, jobs)
CREATE POLICY "Service role has full access"
  ON [nombre]s FOR ALL
  TO service_role
  USING (true);

-- ============================================
-- Triggers
-- ============================================

-- Trigger para updated_at automático
CREATE TRIGGER update_[nombre]s_updated_at
  BEFORE UPDATE ON [nombre]s
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Índices (opcional)
-- ============================================

-- Índice para búsquedas frecuentes
CREATE INDEX idx_[nombre]s_user_id ON [nombre]s(user_id);
CREATE INDEX idx_[nombre]s_status ON [nombre]s(status);
```

## Template para Relación Many-to-Many

```sql
-- Tabla de unión
CREATE TABLE user_[nombre]s (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  [nombre]_id UUID REFERENCES [nombre]s(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, [nombre]_id)
);

ALTER TABLE user_[nombre]s ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships"
  ON user_[nombre]s FOR SELECT
  USING (auth.uid() = user_id);
```

## Template para Tabla con Organización

```sql
CREATE TABLE [nombre]s (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  -- campos...
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE [nombre]s ENABLE ROW LEVEL SECURITY;

-- Política basada en membresía de organización
CREATE POLICY "Org members can view [nombre]s"
  ON [nombre]s FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = [nombre]s.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );
```

## Modificar Tabla Existente

```sql
-- Añadir columna
ALTER TABLE [nombre]s ADD COLUMN new_field TEXT;

-- Añadir columna con default
ALTER TABLE [nombre]s ADD COLUMN status TEXT DEFAULT 'active';

-- Añadir constraint
ALTER TABLE [nombre]s ADD CONSTRAINT chk_status
  CHECK (status IN ('active', 'inactive'));

-- Añadir foreign key
ALTER TABLE [nombre]s ADD COLUMN category_id UUID
  REFERENCES categories(id) ON DELETE SET NULL;

-- Añadir índice
CREATE INDEX idx_[nombre]s_category ON [nombre]s(category_id);
```

## Función para updated_at

Si no existe la función:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Aplicar Migraciones

```bash
# Desarrollo local
npx supabase db push

# Ver estado
npx supabase db status

# Reset (cuidado!)
npx supabase db reset
```

## Buenas Prácticas

1. **Nombres en plural**: `users`, `subscriptions`, `organizations`
2. **Snake_case**: `user_id`, `created_at`
3. **UUIDs como PK**: Más seguros que integers
4. **Siempre RLS**: Nunca dejar tablas sin RLS
5. **Timestamps**: Siempre `created_at` y `updated_at`
6. **CASCADE con cuidado**: Pensar en las consecuencias
7. **Índices**: Para campos de búsqueda frecuente
8. **Comentarios**: Documentar el propósito
