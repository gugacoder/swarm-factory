-- 006_kai_messages.sql — Mensagens individuais em conversas com a Kai

CREATE TABLE IF NOT EXISTS kai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES kai_conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indice: mensagens por conversa ordenadas cronologicamente
CREATE INDEX IF NOT EXISTS idx_kai_messages_conversation_created
  ON kai_messages(conversation_id, created_at);
