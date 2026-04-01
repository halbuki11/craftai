-- File uploads tracking
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_file_uploads_user ON file_uploads(user_id, created_at DESC);

-- RLS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own files" ON file_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own files" ON file_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own files" ON file_uploads FOR DELETE USING (auth.uid() = user_id);
