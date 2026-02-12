-- 007_kai_tool_calls.sql — Chamadas de ferramentas executadas pela Kai

CREATE TABLE IF NOT EXISTS kai_tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES kai_messages(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  input JSONB,
  output JSONB,
  duration_ms INTEGER,
  status tool_call_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indice: tool calls por mensagem
CREATE INDEX IF NOT EXISTS idx_kai_tool_calls_message
  ON kai_tool_calls(message_id);
