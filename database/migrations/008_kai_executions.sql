-- 008_kai_executions.sql — Log de execucoes completas do agent Kai

CREATE TABLE IF NOT EXISTS kai_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES kai_conversations(id) ON DELETE CASCADE,
  intent TEXT,
  model_used TEXT,
  total_duration_ms INTEGER,
  tools_called INTEGER DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indice: execucoes por conversa
CREATE INDEX IF NOT EXISTS idx_kai_executions_conversation
  ON kai_executions(conversation_id, created_at DESC);
