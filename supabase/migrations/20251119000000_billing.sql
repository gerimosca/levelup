-- Migration: Billing tables for Stripe integration
-- Description: Creates customers and subscriptions tables for payment management

-- Tabla customers (mapeo usuario ↔ Stripe)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla subscriptions (estado del plan)
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY, -- stripe subscription_id
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  -- Lifecycle fields from Stripe
  trial_start_at TIMESTAMPTZ,
  trial_end_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancellation_details JSONB,
  -- Additional data
  metadata JSONB DEFAULT '{}',
  attribution_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_stripe_customer_id ON customers(stripe_customer_id);

-- Índices para lifecycle tracking
CREATE INDEX idx_subscriptions_trial_end_at ON subscriptions(trial_end_at)
  WHERE trial_end_at IS NOT NULL;
CREATE INDEX idx_subscriptions_canceled_at ON subscriptions(canceled_at)
  WHERE canceled_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuarios solo ven sus propios datos
CREATE POLICY "Users can view own customer" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role tiene acceso completo (para webhooks)
CREATE POLICY "Service role full access customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE customers IS 'Maps app users to Stripe customers';
COMMENT ON TABLE subscriptions IS 'Stores subscription state synced from Stripe webhooks';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status from Stripe: active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired, paused';
COMMENT ON COLUMN subscriptions.trial_start_at IS 'When the trial period started';
COMMENT ON COLUMN subscriptions.trial_end_at IS 'When the trial period ends/ended';
COMMENT ON COLUMN subscriptions.canceled_at IS 'When the subscription was canceled';
COMMENT ON COLUMN subscriptions.cancellation_reason IS 'Reason for cancellation from Stripe';
COMMENT ON COLUMN subscriptions.ended_at IS 'When subscription actually ended (vs canceled_at which is when cancellation was requested)';
COMMENT ON COLUMN subscriptions.cancel_at IS 'Scheduled cancellation timestamp';
COMMENT ON COLUMN subscriptions.cancellation_details IS 'Full cancellation details from Stripe: reason, comment, feedback';
COMMENT ON COLUMN subscriptions.metadata IS 'Custom metadata from Stripe subscription';
COMMENT ON COLUMN subscriptions.attribution_data IS 'Marketing attribution data (UTM params, referrer, etc)';
