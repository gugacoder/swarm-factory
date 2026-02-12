import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';
import * as authService from '../services/auth-service.js';
import type { UserPayload } from '../services/auth-service.js';

type Env = { Variables: { user: UserPayload } };

const auth = new Hono<Env>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias em segundos

function setRefreshCookie(c: Parameters<typeof setCookie>[0], token: string) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    path: '/api/auth',
    maxAge: REFRESH_MAX_AGE,
  });
}

// POST /api/auth/login
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, 400);
  }

  try {
    const result = await authService.login(parsed.data.email, parsed.data.password);
    setRefreshCookie(c, result.refreshToken);
    return c.json({ accessToken: result.accessToken, user: result.user });
  } catch (e) {
    if (e instanceof authService.AuthError) {
      return c.json({ error: e.message }, e.status as 401);
    }
    throw e;
  }
});

// POST /api/auth/refresh
auth.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, REFRESH_COOKIE);

  if (!refreshToken) {
    return c.json({ error: 'Refresh token não fornecido' }, 401);
  }

  try {
    const result = await authService.refresh(refreshToken);
    setRefreshCookie(c, result.refreshToken);
    return c.json({ accessToken: result.accessToken });
  } catch (e) {
    if (e instanceof authService.AuthError) {
      deleteCookie(c, REFRESH_COOKIE, { path: '/api/auth' });
      return c.json({ error: e.message }, e.status as 401);
    }
    throw e;
  }
});

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const refreshToken = getCookie(c, REFRESH_COOKIE);

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  deleteCookie(c, REFRESH_COOKIE, { path: '/api/auth' });
  return c.json({ ok: true });
});

// GET /api/auth/me
auth.get('/me', async (c) => {
  const user = c.get('user');
  try {
    const userData = await authService.getUserById(user.user_id);
    return c.json({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    });
  } catch (e) {
    if (e instanceof authService.AuthError) {
      return c.json({ error: e.message }, e.status as 404);
    }
    throw e;
  }
});

// PATCH /api/auth/password
auth.patch('/password', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, 400);
  }

  try {
    await authService.changePassword(user.user_id, parsed.data.currentPassword, parsed.data.newPassword);
    return c.json({ ok: true });
  } catch (e) {
    if (e instanceof authService.AuthError) {
      return c.json({ error: e.message }, e.status as 400);
    }
    throw e;
  }
});

export default auth;
