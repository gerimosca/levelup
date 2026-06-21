-- Migration: enciclopedia de descubrimientos (coleccionables de las expediciones)
CREATE TABLE discoveries (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  discovery_key TEXT NOT NULL,
  found_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, discovery_key)
);

ALTER TABLE discoveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own discoveries" ON discoveries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access discoveries" ON discoveries
  FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE discoveries IS 'Descubrimientos coleccionados (enciclopedia); se encuentran en expediciones.';
