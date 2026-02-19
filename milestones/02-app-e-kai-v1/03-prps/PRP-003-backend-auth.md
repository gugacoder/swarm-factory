# PRP-003 — Backend Autenticacao

## Objetivo

Implementar o sistema de autenticacao JWT com refresh token no backbone, incluindo rotas, servico, e middleware de protecao.

## Execution Mode

`implementar`

## Contexto

O PRP-001 criou o app Hono em `apps/backbone/` com dependencias jose e bcryptjs. O PRP-002 criou as tabelas `users` e `refresh_tokens`. O fluxo de auth esta definido em `design.md` secao Autenticacao: access token JWT (15min, em memoria), refresh token (7d, HTTP-only cookie). O middleware de auth deve proteger todas as rotas `/api/*` exceto login, refresh e health.

## Especificacao

### Auth Service (apps/backbone/src/services/auth-service.ts)

- `login(email, password)` — busca usuario por email no PostgreSQL, valida senha com bcrypt, gera access token (jose, 15min, payload: user_id, email, role) e refresh token (7d, payload: user_id, jti), salva refresh na tabela `refresh_tokens`, retorna `{ accessToken, refreshToken, user: { id, email, name, role } }`
- `refresh(jti)` — busca refresh token nao revogado e nao expirado, gera novos tokens (revogar o antigo, criar novo), retorna novos tokens
- `logout(jti)` — marca refresh token como revogado
- `changePassword(userId, currentPassword, newPassword)` — valida senha atual, atualiza hash
- `validateAccessToken(token)` — verifica assinatura e expiracao com jose, retorna payload
- Bcrypt cost factor: 12 (RNF006)

### Auth Middleware (apps/backbone/src/middleware/auth.ts)

- Extrai token do header `Authorization: Bearer <token>`
- Valida com `validateAccessToken`
- Injeta `c.set("user", payload)` no contexto Hono
- Retorna 401 se token ausente, invalido ou expirado
- Aplicado globalmente exceto: `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/health`

### Rate Limit Middleware (apps/backbone/src/middleware/rate-limit.ts)

- Rate limiting in-memory (Map com IP + timestamp)
- Limitar rotas `/api/auth/*` a 5 requests por minuto por IP (RNF009)
- Retornar 429 com `Retry-After` header

### Auth Routes (apps/backbone/src/routes/auth.ts)

- `POST /api/auth/login` — body `{ email, password }` validado com Zod, retorna `{ accessToken, user }`, seta refresh como cookie HTTP-only
- `POST /api/auth/refresh` — le cookie de refresh, retorna novo access token, seta novo refresh cookie
- `POST /api/auth/logout` — revoga refresh token, limpa cookie
- `PATCH /api/auth/password` — body `{ currentPassword, newPassword }` (autenticado), validacao Zod (min 6 chars)
- `GET /api/auth/me` — retorna dados do usuario logado (OSD004)

### Validacao Zod

- Login: `{ email: z.string().email(), password: z.string().min(1) }`
- Password: `{ currentPassword: z.string().min(1), newPassword: z.string().min(6) }`

### Cookies

- Refresh token cookie: `refreshToken`, HTTP-only, Secure (em producao), SameSite=Strict, Path=/api/auth, Max-Age=7 dias

### Verificacao

Login com admin@mail.com / 12345678 retorna access token. Access token funciona em rotas protegidas. Refresh renova token. Logout invalida refresh. Rota sem token retorna 401.

## Limites

- Nao implementar OAuth ou login social
- Nao implementar registro de novos usuarios via API (usuario admin cria outros se necessario)
- Nao usar bibliotecas de session store (refresh tokens estao no PostgreSQL)
- Nao armazenar access token em cookie (apenas em memoria no client)
