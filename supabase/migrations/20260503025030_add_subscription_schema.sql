/*
  # Add Subscription Schema for Future Use

  1. New Tables
    - `subscriptions` -- Tracks user subscription plans, billing, and status
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - shop_id (uuid, references shops)
      - plan (text: free/starter/pro/enterprise)
      - status (text: active/past_due/canceled/trialing)
      - current_period_start (timestamptz)
      - current_period_end (timestamptz)
      - cancel_at_period_end (boolean)
      - trial_end (timestamptz, nullable)
      - stripe_customer_id (text, nullable -- for future Stripe integration)
      - stripe_subscription_id (text, nullable)
      - created_at / updated_at (timestamptz)

    - `subscription_events` -- Audit log for subscription changes
      - id (uuid, primary key)
      - subscription_id (uuid, references subscriptions)
      - event_type (text: created/upgraded/downgraded/canceled/reactivated/trial_started/trial_ended/payment_failed)
      - from_plan (text, nullable)
      - to_plan (text, nullable)
      - metadata (jsonb, nullable -- for storing extra event data)
      - created_at (timestamptz)

  2. Indexes
    - subscriptions: user_id, shop_id, status, stripe_customer_id, stripe_subscription_id
    - subscription_events: subscription_id

  3. Security
    - RLS enabled on both tables
    - Users can CRUD own subscriptions
    - Admins can read/update all subscriptions
    - Users can view own subscription events
    - Admins can view all subscription events
    - Only admins can insert/update subscription_events (webhook/edge function use)

  4. Important Notes
    - This is DATABASE ONLY, no frontend changes
    - Stripe fields are nullable for future integration
    - The subscription_events table serves as an audit trail
*/

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'expired')),
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_shop_id ON subscriptions(shop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any subscription"
  ON subscriptions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTION EVENTS TABLE (Audit Trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'upgraded', 'downgraded', 'canceled',
    'reactivated', 'trial_started', 'trial_ended',
    'payment_failed', 'payment_succeeded', 'expired'
  )),
  from_plan TEXT,
  to_plan TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_subscription_id ON subscription_events(subscription_id);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT TO authenticated
  USING (subscription_id IN (SELECT id FROM subscriptions WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all subscription events"
  ON subscription_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can insert subscription events"
  ON subscription_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Service role can manage subscription events"
  ON subscription_events FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- ADD UPDATED_AT TRIGGER FOR SUBSCRIPTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_shops_updated_at ON shops;
CREATE TRIGGER trigger_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
