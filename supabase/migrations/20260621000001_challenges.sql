-- Retos compartidos: amigos hacen la misma temporada juntos y se ven el progreso.

CREATE TABLE challenges (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT    NOT NULL,
  invite_code TEXT    NOT NULL UNIQUE,
  created_by  UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE challenge_members (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID    REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- ── RLS ────────────────────────────────────────────────────────────────────────

ALTER TABLE challenges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_members ENABLE ROW LEVEL SECURITY;

-- Challenges: visible si eres miembro
CREATE POLICY "Members can view their challenges"
  ON challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenge_members cm
      WHERE cm.challenge_id = id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can delete challenge"
  ON challenges FOR DELETE
  USING (auth.uid() = created_by);

-- Miembros: visible si compartes reto
CREATE POLICY "Members can view challenge members"
  ON challenge_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenge_members cm2
      WHERE cm2.challenge_id = challenge_id AND cm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join challenges"
  ON challenge_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
  ON challenge_members FOR DELETE
  USING (auth.uid() = user_id);

-- Service role acceso completo
CREATE POLICY "Service role full access challenges"
  ON challenges FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access challenge_members"
  ON challenge_members FOR ALL TO service_role USING (true);
