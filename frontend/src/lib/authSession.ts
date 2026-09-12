// In-memory cache of "do we have a real Supabase session", backing
// session.ts's hasAccount(). The session itself lives in httpOnly cookies
// this code can never read directly, so App.tsx must await
// refreshAuthSession() once before any route that checks hasAccount() can
// render — otherwise this cache would still read its initial `false` and
// every guard would look logged-out on first load.
import { getSession } from '../api/auth';

let cachedAuthenticated = false;

export async function refreshAuthSession(): Promise<boolean> {
  try {
    const session = await getSession();
    cachedAuthenticated = session.authenticated;
  } catch {
    cachedAuthenticated = false;
  }
  return cachedAuthenticated;
}

export function hasCachedAccount(): boolean {
  return cachedAuthenticated;
}

export function setCachedAccount(authenticated: boolean): void {
  cachedAuthenticated = authenticated;
}
