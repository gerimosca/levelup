-- Create page_views table for basic analytics
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_hash TEXT NOT NULL, -- Privacy-first: Hash of user_agent + date
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous visitors
  path TEXT NOT NULL,

  -- UTM parameters (copied from URL or session)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Additional context
  referrer TEXT,
  locale TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_page_views_date ON page_views(created_at DESC);
CREATE INDEX idx_page_views_visitor ON page_views(visitor_hash, created_at);
CREATE INDEX idx_page_views_user ON page_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_utm_source ON page_views(utm_source) WHERE utm_source IS NOT NULL;

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (for API routes)
CREATE POLICY "Service role has full access to page_views"
  ON page_views
  FOR ALL
  TO service_role
  USING (true);

-- Policy: Authenticated users can insert their own page views
CREATE POLICY "Authenticated users can insert own page views"
  ON page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admins can view all page views
CREATE POLICY "Admins can view all page views"
  ON page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND ('admin' = ANY(profiles.user_flags) OR 'super_admin' = ANY(profiles.user_flags))
    )
  );

-- Add comment for documentation
COMMENT ON TABLE page_views IS 'Tracks page views for basic analytics. Visitor hash is privacy-preserving (no PII stored).';
COMMENT ON COLUMN page_views.visitor_hash IS 'SHA256 hash of user_agent + date for unique visitor tracking (privacy-first)';
COMMENT ON COLUMN page_views.path IS 'The path of the page visited (e.g., /dashboard, /pricing)';