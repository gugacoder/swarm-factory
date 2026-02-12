-- 011_system_settings.sql — Configuracoes globais do sistema por usuario

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'system_settings'::regclass
  ) THEN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON system_settings
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

-- Indice unique: settings por usuario e chave
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_system_settings_user_key'
  ) THEN
    CREATE UNIQUE INDEX idx_system_settings_user_key ON system_settings(user_id, key);
  END IF;
END $$;
