-- 005_kai_conversations.sql — Conversas entre operador e Kai

CREATE TABLE IF NOT EXISTS kai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'kai_conversations'::regclass
  ) THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON kai_conversations
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

-- Indice: conversas por usuario ordenadas por atividade
CREATE INDEX IF NOT EXISTS idx_kai_conversations_user_updated
  ON kai_conversations(user_id, updated_at DESC);
