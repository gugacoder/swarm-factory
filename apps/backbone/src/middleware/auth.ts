import type { MiddlewareHandler } from 'hono';
import { validateAccessToken } from '../services/auth-service.js';

const PUBLIC_PATHS = [
  'POST /api/auth/login',
  'POST /api/auth/refresh',
  'POST /api/auth/logout',
  'GET /api/health',
];

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const method = c.req.method;
  const path = c.req.path;
  const key = `${method} ${path}`;

  if (PUBLIC_PATHS.includes(key)) {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token não fornecido' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await validateAccessToken(token);
    c.set('user', payload);
    return next();
  } catch {
    return c.json({ error: 'Token inválido ou expirado' }, 401);
  }
};
