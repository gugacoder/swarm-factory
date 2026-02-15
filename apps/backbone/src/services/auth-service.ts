import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import pool from '../db.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não configurada — verifique o .env');
if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET não configurada — verifique o .env');
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 dias

export interface UserPayload {
  user_id: string;
  email: string;
  role: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; role: string };
}

async function generateAccessToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ user_id: payload.user_id, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

async function generateRefreshToken(userId: string): Promise<{ token: string; jti: string }> {
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ user_id: userId, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRY_SECONDS}s`)
    .sign(JWT_REFRESH_SECRET);
  return { token, jti };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await pool.query(
    'SELECT id, email, password_hash, name, role, active FROM users WHERE email = $1',
    [email],
  );

  if (result.rows.length === 0) {
    throw new AuthError('Credenciais inválidas', 401);
  }

  const user = result.rows[0];

  if (!user.active) {
    throw new AuthError('Usuário inativo', 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AuthError('Credenciais inválidas', 401);
  }

  const accessToken = await generateAccessToken({
    user_id: user.id,
    email: user.email,
    role: user.role,
  });

  const { token: refreshToken, jti } = await generateRefreshToken(user.id);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, jti, expires_at) VALUES ($1, $2, $3)',
    [user.id, jti, expiresAt],
  );

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export async function refresh(refreshTokenStr: string): Promise<{ accessToken: string; refreshToken: string }> {
  let payload;
  try {
    const result = await jwtVerify(refreshTokenStr, JWT_REFRESH_SECRET);
    payload = result.payload as { user_id: string; jti: string };
  } catch {
    throw new AuthError('Refresh token inválido', 401);
  }

  const tokenResult = await pool.query(
    'SELECT id, user_id, jti, expires_at, revoked FROM refresh_tokens WHERE jti = $1',
    [payload.jti],
  );

  if (tokenResult.rows.length === 0 || tokenResult.rows[0].revoked) {
    throw new AuthError('Refresh token revogado', 401);
  }

  const storedToken = tokenResult.rows[0];
  if (new Date(storedToken.expires_at) < new Date()) {
    throw new AuthError('Refresh token expirado', 401);
  }

  // Revogar token antigo
  await pool.query('UPDATE refresh_tokens SET revoked = true WHERE jti = $1', [payload.jti]);

  // Buscar dados do usuário
  const userResult = await pool.query(
    'SELECT id, email, name, role, active FROM users WHERE id = $1',
    [storedToken.user_id],
  );

  if (userResult.rows.length === 0 || !userResult.rows[0].active) {
    throw new AuthError('Usuário não encontrado ou inativo', 401);
  }

  const user = userResult.rows[0];

  const accessToken = await generateAccessToken({
    user_id: user.id,
    email: user.email,
    role: user.role,
  });

  const { token: newRefreshToken, jti: newJti } = await generateRefreshToken(user.id);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, jti, expires_at) VALUES ($1, $2, $3)',
    [user.id, newJti, expiresAt],
  );

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshTokenStr: string): Promise<void> {
  let payload;
  try {
    const result = await jwtVerify(refreshTokenStr, JWT_REFRESH_SECRET);
    payload = result.payload as { jti: string };
  } catch {
    // Token inválido — nada a revogar
    return;
  }

  await pool.query('UPDATE refresh_tokens SET revoked = true WHERE jti = $1', [payload.jti]);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    throw new AuthError('Usuário não encontrado', 404);
  }

  const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!valid) {
    throw new AuthError('Senha atual incorreta', 400);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
}

export async function validateAccessToken(token: string): Promise<UserPayload> {
  try {
    const result = await jwtVerify(token, JWT_SECRET);
    const p = result.payload as { user_id: string; email: string; role: string };
    return { user_id: p.user_id, email: p.email, role: p.role };
  } catch {
    throw new AuthError('Token inválido ou expirado', 401);
  }
}

export async function getUserById(userId: string) {
  const result = await pool.query(
    'SELECT id, email, name, role, active, created_at, updated_at FROM users WHERE id = $1',
    [userId],
  );
  if (result.rows.length === 0) {
    throw new AuthError('Usuário não encontrado', 404);
  }
  return result.rows[0];
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
