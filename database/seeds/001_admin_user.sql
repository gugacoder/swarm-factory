-- 001_admin_user.sql — Seed do usuario admin
-- Senha: admin123 (hash bcrypt cost 12 via pgcrypto)
INSERT INTO users (email, password_hash, name, role, active)
VALUES (
  'admin@ekai.local',
  crypt('admin123', gen_salt('bf', 12)),
  'Administrador',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;
