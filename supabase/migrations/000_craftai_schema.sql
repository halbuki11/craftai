-- =============================================
-- CraftAI - Full Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  timezone TEXT DEFAULT 'Europe/Istanbul',
  settings JSONB DEFAULT '{
    "preferred_model": "sonnet",
    "preferred_language": "auto"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTES
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  raw_transcript TEXT NOT NULL,
  formatted_content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  language TEXT,
  ai_confidence NUMERIC(3,2),
  processing_time_ms INTEGER,
  has_action_items BOOLEAN DEFAULT FALSE,
  has_calendar_event BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id, created_at DESC);

-- Full-text search
ALTER TABLE notes ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(raw_transcript, '') || ' ' || coalesce(formatted_content, ''))
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING GIN(search_vector);

-- ============================================
-- NOTE DELIVERIES (action tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS note_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  external_id TEXT,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_note ON note_deliveries(note_id);

-- ============================================
-- TODOS
-- ============================================
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  source_note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id, status);

-- ============================================
-- SUBSCRIPTION PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits_per_month INTEGER NOT NULL,
  price_monthly INTEGER NOT NULL,
  stripe_price_id TEXT,
  allowed_models TEXT[] NOT NULL,
  max_file_size_mb INTEGER DEFAULT 25,
  features JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO subscription_plans (id, name, credits_per_month, price_monthly, allowed_models, sort_order) VALUES
  ('free',     'Free',     20,    0,    '{haiku}',               0),
  ('starter',  'Starter',  500,   900,  '{haiku,sonnet}',        1),
  ('pro',      'Pro',      2000,  2900, '{haiku,sonnet,opus}',   2),
  ('business', 'Business', 10000, 9900, '{haiku,sonnet,opus}',   3)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USER SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'expired', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- USER CREDITS
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 20,
  credits_total INTEGER NOT NULL DEFAULT 20,
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREDIT USAGE LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL,
  credits_remaining_after INTEGER NOT NULL,
  model TEXT NOT NULL,
  skill_id TEXT,
  action_type TEXT,
  source TEXT NOT NULL DEFAULT 'web',
  request_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_usage_user ON credit_usage_logs(user_id, created_at DESC);

-- ============================================
-- SKILLS
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  default_model TEXT DEFAULT 'sonnet',
  credit_multiplier NUMERIC(3,2) DEFAULT 1.0,
  requires_file BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Notes
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Note deliveries
CREATE POLICY "Users can view own deliveries" ON note_deliveries FOR SELECT
  USING (EXISTS (SELECT 1 FROM notes WHERE notes.id = note_deliveries.note_id AND notes.user_id = auth.uid()));

-- Todos
CREATE POLICY "Users can view own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions & Credits (read only for users, service role writes)
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON credit_usage_logs FOR SELECT USING (auth.uid() = user_id);

-- Public read tables
CREATE POLICY "Anyone can view active plans" ON subscription_plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Anyone can view active skills" ON skills FOR SELECT USING (is_active = TRUE);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-provision free plan + credits on profile creation
CREATE OR REPLACE FUNCTION public.provision_free_plan()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  VALUES (NEW.id, 'free', 'active', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_credits (user_id, credits_remaining, credits_total, period_start, period_end)
  VALUES (NEW.id, 50, 50, NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_provision ON profiles;
CREATE TRIGGER on_profile_created_provision
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION provision_free_plan();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Atomic credit deduction
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID, p_credits INTEGER, p_model TEXT,
  p_skill_id TEXT DEFAULT NULL, p_action_type TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'web', p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE(success BOOLEAN, remaining INTEGER, error_message TEXT) AS $$
DECLARE
  v_remaining INTEGER;
  v_period_end TIMESTAMPTZ;
BEGIN
  SELECT uc.credits_remaining, uc.period_end INTO v_remaining, v_period_end
  FROM public.user_credits uc WHERE uc.user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Kredi kaydı bulunamadı'::TEXT; RETURN;
  END IF;
  IF v_period_end < NOW() THEN
    RETURN QUERY SELECT FALSE, 0, 'Kredi dönemi sona erdi'::TEXT; RETURN;
  END IF;
  IF v_remaining < p_credits THEN
    RETURN QUERY SELECT FALSE, v_remaining, 'Yetersiz kredi'::TEXT; RETURN;
  END IF;

  UPDATE public.user_credits SET credits_remaining = credits_remaining - p_credits, updated_at = NOW() WHERE user_id = p_user_id;

  INSERT INTO public.credit_usage_logs (user_id, credits_used, credits_remaining_after, model, skill_id, action_type, source, request_metadata)
  VALUES (p_user_id, p_credits, v_remaining - p_credits, p_model, p_skill_id, p_action_type, p_source, p_metadata);

  RETURN QUERY SELECT TRUE, v_remaining - p_credits, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check credits (read-only)
CREATE OR REPLACE FUNCTION public.check_credits(p_user_id UUID)
RETURNS TABLE(credits_remaining INTEGER, credits_total INTEGER, period_end TIMESTAMPTZ, is_valid BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT uc.credits_remaining, uc.credits_total, uc.period_end, (uc.period_end > NOW()) AS is_valid
  FROM public.user_credits uc WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset credits
CREATE OR REPLACE FUNCTION public.reset_credits(
  p_user_id UUID, p_credits INTEGER, p_period_start TIMESTAMPTZ, p_period_end TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_remaining, credits_total, period_start, period_end, updated_at)
  VALUES (p_user_id, p_credits, p_credits, p_period_start, p_period_end, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    credits_remaining = p_credits, credits_total = p_credits,
    period_start = p_period_start, period_end = p_period_end, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
