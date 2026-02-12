-- 012_onboarding_progress.sql — Progresso de onboarding por usuario

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_completed TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, step_completed)
);

-- Indice: progresso por usuario
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user
  ON onboarding_progress(user_id);
