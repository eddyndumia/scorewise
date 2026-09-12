import { BASE_URL } from './client';

export interface AuthSession {
  authenticated: boolean;
  email?: string;
}

async function handleAuthResponse(res: Response): Promise<{ email?: string }> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.detail === 'string' ? body.detail : `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function signUp(email: string, password: string): Promise<{ email?: string }> {
  const res = await fetch(`${BASE_URL}/v1/auth/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleAuthResponse(res);
}

export async function logIn(email: string, password: string): Promise<{ email?: string }> {
  const res = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleAuthResponse(res);
}

export async function logOut(): Promise<void> {
  await fetch(`${BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function getSession(): Promise<AuthSession> {
  const res = await fetch(`${BASE_URL}/v1/auth/session`, { credentials: 'include' });
  if (!res.ok) return { authenticated: false };
  return res.json();
}
