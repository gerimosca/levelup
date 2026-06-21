-- =============================================
-- App Settings Table
-- =============================================
-- Configuración global de la aplicación editable desde panel admin
-- Incluye: info-bar, email journeys, feature flags, cross-selling

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('info_bar', 'email', 'features', 'cross_sell', 'general')
  ),
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Índices para Performance
-- =============================================

CREATE INDEX idx_app_settings_category ON app_settings(category);
CREATE INDEX idx_app_settings_updated_at ON app_settings(updated_at DESC);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden leer/modificar settings
CREATE POLICY "Admins can manage app settings"
  ON app_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND 'admin' = ANY(user_flags)
    )
  );

-- Política: Service role tiene acceso completo (webhooks, scripts)
CREATE POLICY "Service role full access to settings"
  ON app_settings
  FOR ALL
  TO service_role
  USING (true);

-- Política: Lectura pública para info_bar (necesario para mostrar banner)
CREATE POLICY "Public can read info_bar settings"
  ON app_settings
  FOR SELECT
  USING (category = 'info_bar');

-- =============================================
-- Trigger para updated_at
-- =============================================

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Settings por Defecto
-- =============================================

-- Info Bar - Desactivado por defecto
INSERT INTO app_settings (key, value, category, description) VALUES
(
  'info_bar',
  '{
    "enabled": false,
    "scope": "all",
    "mode": "info",
    "messages": {
      "en": "Important announcement",
      "es": "Anuncio importante"
    },
    "dismissible": true
  }'::jsonb,
  'info_bar',
  'Global information bar shown across the application'
);

-- Email Journeys - Todos activados por defecto
INSERT INTO app_settings (key, value, category, description) VALUES
(
  'email_journeys',
  '{
    "welcome_series": {
      "enabled": true,
      "name": "Welcome Series",
      "description": "Onboarding emails for new users"
    },
    "trial_ending": {
      "enabled": true,
      "name": "Trial Ending",
      "description": "Reminder emails before trial expires"
    },
    "payment_failed": {
      "enabled": true,
      "name": "Payment Failed",
      "description": "Notifications for failed payments"
    },
    "feature_announcements": {
      "enabled": true,
      "name": "Feature Announcements",
      "description": "Updates about new features"
    },
    "monthly_digest": {
      "enabled": false,
      "name": "Monthly Digest",
      "description": "Monthly summary of activity"
    }
  }'::jsonb,
  'email',
  'Email journey configurations'
);

-- Feature Flags
INSERT INTO app_settings (key, value, category, description) VALUES
(
  'feature_flags',
  '{
    "organizations": true,
    "api_access": false,
    "advanced_analytics": false,
    "white_label": false
  }'::jsonb,
  'features',
  'Feature flags for gradual rollout'
);

-- Cross-Sell Products
INSERT INTO app_settings (key, value, category, description) VALUES
(
  'cross_sell_products',
  '{
    "products": [
      {
        "id": "premium_support",
        "name": "Premium Support",
        "description": "24/7 priority support with dedicated account manager",
        "price": "$299/mo",
        "cta": "Learn More",
        "url": "/pricing#premium-support",
        "badge": "Popular"
      },
      {
        "id": "api_access",
        "name": "API Access",
        "description": "Full REST API access with 10,000 requests/day",
        "price": "$99/mo",
        "cta": "Enable API",
        "url": "/settings/api",
        "badge": null
      },
      {
        "id": "white_label",
        "name": "White Label",
        "description": "Remove branding and use your own domain",
        "price": "$499/mo",
        "cta": "Contact Sales",
        "url": "/contact-sales",
        "badge": "Enterprise"
      }
    ]
  }'::jsonb,
  'cross_sell',
  'Cross-selling product recommendations for admin dashboard'
);

-- =============================================
-- Helper Function (Opcional)
-- =============================================
-- Función para obtener un setting por key con type safety en el resultado

CREATE OR REPLACE FUNCTION get_app_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM app_settings
  WHERE key = setting_key;

  RETURN setting_value;
END;
$$;

-- Comentarios para documentación
COMMENT ON TABLE app_settings IS 'Global application settings managed from admin panel';
COMMENT ON COLUMN app_settings.key IS 'Unique setting identifier (e.g., info_bar, email_journeys)';
COMMENT ON COLUMN app_settings.value IS 'JSON setting value - schema depends on category';
COMMENT ON COLUMN app_settings.category IS 'Setting category for organization and permissions';
COMMENT ON FUNCTION get_app_setting IS 'Helper to retrieve setting value by key';
