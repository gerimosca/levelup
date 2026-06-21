-- Migration: LevelUp game state
-- Description: Tablas del juego LevelUp (RPG de hábitos). Todo por usuario, RLS estricto.
-- Ver docs/design/04-architecture.md §3.

-- =============================================================================
-- player_state — nivel y XP del jugador (1 fila por usuario)
-- =============================================================================
CREATE TABLE player_state (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  level INT NOT NULL DEFAULT 1,
  xp_total INT NOT NULL DEFAULT 0,
  current_season_key TEXT NOT NULL DEFAULT 's1-reset',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- attributes — 5 atributos por usuario (vitality/strength/discipline/energy/resistance)
-- =============================================================================
CREATE TABLE attributes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('vitality', 'strength', 'discipline', 'energy', 'resistance')
  ),
  points INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, type)
);

-- =============================================================================
-- habit_logs — registro de hábitos por día (idempotente por user+habit+día)
-- =============================================================================
CREATE TABLE habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_key TEXT NOT NULL,
  day_date DATE NOT NULL,
  value NUMERIC NOT NULL DEFAULT 1,
  xp_awarded INT NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, habit_key, day_date)
);
CREATE INDEX idx_habit_logs_user_day ON habit_logs(user_id, day_date);

-- =============================================================================
-- streaks — racha actual y récord (1 fila por usuario)
-- =============================================================================
CREATE TABLE streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current INT NOT NULL DEFAULT 0,
  longest INT NOT NULL DEFAULT 0,
  last_active_day DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- season_progress — progreso por días cumplidos (NO por calendario)
-- =============================================================================
CREATE TABLE season_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  season_key TEXT NOT NULL,
  days_completed INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, season_key)
);

-- =============================================================================
-- enemy_state — el Saboteador (HP por temporada)
-- =============================================================================
CREATE TABLE enemy_state (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  season_key TEXT NOT NULL,
  hp_current INT NOT NULL,
  hp_max INT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, season_key)
);

-- =============================================================================
-- pet — la mascota (1 fila por usuario, nunca muere)
-- =============================================================================
CREATE TABLE pet (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stage TEXT NOT NULL DEFAULT 'egg' CHECK (
    stage IN ('egg', 'hatchling', 'juvenile', 'adult', 'final')
  ),
  care_days INT NOT NULL DEFAULT 0,
  mood TEXT NOT NULL DEFAULT 'happy' CHECK (
    mood IN ('happy', 'ok', 'tired', 'sad')
  ),
  last_interaction TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- achievements — logros desbloqueados
-- =============================================================================
CREATE TABLE achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_key)
);

-- =============================================================================
-- equipment — objetos cosméticos desbloqueados / equipados
-- =============================================================================
CREATE TABLE equipment (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  equipped_slot TEXT,
  PRIMARY KEY (user_id, item_key)
);

-- =============================================================================
-- daily_event — evento del día (determinista por usuario+día)
-- =============================================================================
CREATE TABLE daily_event (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_date DATE NOT NULL,
  event_key TEXT NOT NULL,
  PRIMARY KEY (user_id, day_date)
);

-- =============================================================================
-- journal_entries — diario nocturno
-- =============================================================================
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_date DATE NOT NULL,
  mood TEXT,
  felt_text TEXT,
  learned_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, day_date)
);

-- =============================================================================
-- Row Level Security: cada usuario solo accede a sus propios datos
-- =============================================================================
DO $$
DECLARE
  t TEXT;
  game_tables TEXT[] := ARRAY[
    'player_state', 'attributes', 'habit_logs', 'streaks', 'season_progress',
    'enemy_state', 'pet', 'achievements', 'equipment', 'daily_event', 'journal_entries'
  ];
BEGIN
  FOREACH t IN ARRAY game_tables LOOP
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

-- =============================================================================
-- Triggers updated_at (tablas con esa columna)
-- =============================================================================
CREATE TRIGGER update_player_state_updated_at BEFORE UPDATE ON player_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attributes_updated_at BEFORE UPDATE ON attributes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enemy_state_updated_at BEFORE UPDATE ON enemy_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pet_updated_at BEFORE UPDATE ON pet
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Bootstrap: al crear player_state, sembrar las 5 filas de atributos
-- =============================================================================
CREATE OR REPLACE FUNCTION seed_player_attributes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.attributes (user_id, type)
  VALUES
    (NEW.user_id, 'vitality'),
    (NEW.user_id, 'strength'),
    (NEW.user_id, 'discipline'),
    (NEW.user_id, 'energy'),
    (NEW.user_id, 'resistance')
  ON CONFLICT (user_id, type) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_player_state_created
  AFTER INSERT ON player_state
  FOR EACH ROW
  EXECUTE FUNCTION seed_player_attributes();

COMMENT ON TABLE player_state IS 'LevelUp: nivel y XP del jugador';
COMMENT ON TABLE habit_logs IS 'LevelUp: registro idempotente de hábitos por día';
COMMENT ON TABLE enemy_state IS 'LevelUp: el Saboteador (HP por temporada)';
COMMENT ON TABLE pet IS 'LevelUp: la mascota, nunca muere';
