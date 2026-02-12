-- 004_refresh_tokens.sql — Tokens de refresh para autenticacao JWT

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indice parcial: refresh tokens ativos por usuario
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active
  ON refresh_tokens(user_id)
  WHERE revoked = false;

-- Indice unique: busca por JTI
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_refresh_tokens_jti'
  ) THEN
    CREATE UNIQUE INDEX idx_refresh_tokens_jti ON refresh_tokens(jti);
  END IF;
END $$;
