-- API keys for developer access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own keys" ON api_keys FOR ALL USING (auth.uid() = user_id);
