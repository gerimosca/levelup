-- Migration: el mundo vivo (expediciones, inventario de materiales, campamento)
-- Ver docs/design/08-world-spec.md

-- Expedición (un único slot por usuario)
CREATE TABLE expeditions (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  active BOOLEAN NOT NULL DEFAULT false,
  departed_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventario de materiales (moneda del campamento)
CREATE TABLE inventory (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_key TEXT NOT NULL,
  qty INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_key)
);

-- Estructuras construidas del campamento
CREATE TABLE camp_structures (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  structure_key TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  built_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, structure_key)
);

-- RLS
DO $$
DECLARE
  t TEXT;
  world_tables TEXT[] := ARRAY['expeditions', 'inventory', 'camp_structures'];
BEGIN
  FOREACH t IN ARRAY world_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format(
      'CREATE POLICY "Users manage own %1$s" ON %1$I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Service role full access %1$s" ON %1$I FOR ALL USING (auth.role() = ''service_role'');',
      t
    );
  END LOOP;
END $$;

CREATE TRIGGER update_expeditions_updated_at BEFORE UPDATE ON expeditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE expeditions IS 'Expedición del héroe: sale al cumplir la misión principal, vuelve a las pocas horas con loot.';
COMMENT ON TABLE inventory IS 'Materiales (madera, piedra...) para construir el campamento. Se ganan con hábitos + expediciones.';
COMMENT ON TABLE camp_structures IS 'Estructuras del campamento construidas por el usuario.';
