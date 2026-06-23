-- Almacena los rerolls manuales de misiones por usuario/día.
-- Un usuario puede reemplazar una misión secundaria pagando materiales.
CREATE TABLE mission_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_date DATE NOT NULL,
  original_habit TEXT NOT NULL,
  replacement_habit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_date, original_habit)
);

ALTER TABLE mission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mission overrides"
  ON mission_overrides FOR ALL
  USING (auth.uid() = user_id);
