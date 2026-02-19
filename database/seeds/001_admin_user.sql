-- 001_admin_user.sql — Seed do usuario admin
-- Senha: 12345678 (hash bcrypt cost 12 via pgcrypto)
INSERT INTO users (email, password_hash, name, role, active)
VALUES (
  'admin@mail.com',
  crypt('12345678', gen_salt('bf', 12)),
  'Administrador',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;
