/**
 * Fetch wrapper com Authorization header e refresh automático.
 * O token é armazenado em memória (nunca em localStorage).
 */

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers, credentials: 'include' });

  // Se 401, tenta refresh
  if (res.status === 401 && accessToken) {
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      accessToken = data.accessToken;

      // Retenta a requisição original
      headers.set('Authorization', `Bearer ${accessToken}`);
      const retryRes = await fetch(url, { ...options, headers, credentials: 'include' });

      if (!retryRes.ok) {
        throw new ApiError(retryRes.status, await retryRes.text());
      }
      return retryRes.json();
    }

    // Refresh falhou — redireciona para login
    accessToken = null;
    window.location.href = '/login';
    throw new ApiError(401, 'Sessão expirada');
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`HTTP ${status}: ${body}`);
    this.name = 'ApiError';
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url),

  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  del: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
