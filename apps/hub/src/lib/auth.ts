import { api, setAccessToken, getAccessToken } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function login(email: string, password: string): Promise<User> {
  const data = await api.post<LoginResponse>('/api/auth/login', { email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function refresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } catch {
    // ignora erro no logout
  }
  setAccessToken(null);
}

export async function getUser(): Promise<User> {
  return api.get<User>('/api/auth/me');
}

export { getAccessToken };
