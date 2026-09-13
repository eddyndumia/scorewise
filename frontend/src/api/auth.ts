import { BASE_URL, NetworkError } from './client';

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
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/v1/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new NetworkError();
  }
  return handleAuthResponse(res);
}

export async function logIn(email: string, password: string): Promise<{ email?: string }> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/v1/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new NetworkError();
  }
  return handleAuthResponse(res);
}

export async function logOut(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/v1/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {
    // Best-effort — logout still clears local state (see lib/session.ts callers).
  }
}

export async function getSession(): Promise<AuthSession> {
  try {
    const res = await fetch(`${BASE_URL}/v1/auth/session`, { credentials: 'include' });
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch {
    // Network failure on boot (e.g. a sleeping backend) — treat as
    // unauthenticated rather than crashing App.tsx's startup check; the
    // user lands on a normal login/onboarding screen instead of a blank page.
    return { authenticated: false };
  }
}
