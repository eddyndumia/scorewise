// Client-side "session" — PIN/unlock state (device-level lock) lives in
// localStorage/sessionStorage as before. Account existence, though, is now a
// real server fact (a Supabase auth session, held as an httpOnly cookie this
// code can't read) rather than a local flag — see lib/authSession.ts for the
// cache that backs hasAccount() below.
//
// SECURITY NOTE: storing the PIN itself in localStorage (even lightly obscured)
// is not how a real app should do this — a real implementation verifies the
// PIN server-side (or via platform secure storage) and never persists it in
// plain, script-readable storage. This is a UI/UX prototype of the flow, not
// a secure implementation. Flagging rather than pretending otherwise.

import { hasCachedAccount } from './authSession';

const PIN_KEY = 'sw_pin';
const BIOMETRIC_CRED_KEY = 'sw_biometric_cred_id';
const UNLOCKED_KEY = 'sw_unlocked';
const TERMS_KEY = 'sw_terms_accepted';
const PIN_FAILS_KEY = 'sw_pin_fails';
const PIN_LOCKOUT_UNTIL_KEY = 'sw_pin_lockout_until';

// Escalating lockout after repeated wrong PINs, same idea as iOS/Android's
// on-device passcode lockout — it raises the cost of someone picking up an
// unlocked phone and guessing, and of simple scripted retries against this
// client. It does NOT protect against an attacker who can read/write
// localStorage directly (they could just clear these two keys, or set
// sw_unlocked itself) — that class of attack can only be closed by moving
// PIN verification server-side, which needs the real backend.
const LOCKOUT_SCHEDULE: Record<number, number> = {
  3: 15_000,
  5: 60_000,
  8: 5 * 60_000,
};

export function hasAcceptedTerms(): boolean {
  return localStorage.getItem(TERMS_KEY) === 'true';
}

export function setAcceptedTerms(): void {
  localStorage.setItem(TERMS_KEY, 'true');
}

export function hasAccount(): boolean {
  return hasCachedAccount();
}

export function hasPin(): boolean {
  return localStorage.getItem(PIN_KEY) !== null;
}

export function setPin(pin: string): void {
  localStorage.setItem(PIN_KEY, pin);
}

export function checkPin(pin: string): boolean {
  return localStorage.getItem(PIN_KEY) === pin;
}

export function getPinLockoutRemainingMs(): number {
  const until = Number(localStorage.getItem(PIN_LOCKOUT_UNTIL_KEY) ?? 0);
  return Math.max(0, until - Date.now());
}

export function recordPinFailure(): void {
  const fails = Number(localStorage.getItem(PIN_FAILS_KEY) ?? 0) + 1;
  localStorage.setItem(PIN_FAILS_KEY, String(fails));
  const delay = LOCKOUT_SCHEDULE[fails];
  if (delay) {
    localStorage.setItem(PIN_LOCKOUT_UNTIL_KEY, String(Date.now() + delay));
  }
}

export function clearPinFailures(): void {
  localStorage.removeItem(PIN_FAILS_KEY);
  localStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
}

export function isUnlocked(): boolean {
  return sessionStorage.getItem(UNLOCKED_KEY) === 'true';
}

export function setUnlocked(): void {
  sessionStorage.setItem(UNLOCKED_KEY, 'true');
}

export function clearUnlocked(): void {
  sessionStorage.removeItem(UNLOCKED_KEY);
}

export function clearAll(): void {
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem(BIOMETRIC_CRED_KEY);
  localStorage.removeItem(TERMS_KEY);
  localStorage.removeItem(PIN_FAILS_KEY);
  localStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
  sessionStorage.removeItem(UNLOCKED_KEY);
}

export function hasBiometric(): boolean {
  return localStorage.getItem(BIOMETRIC_CRED_KEY) !== null;
}

export function disableBiometric(): void {
  localStorage.removeItem(BIOMETRIC_CRED_KEY);
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function bufferToBase64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlToBuffer(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// Real WebAuthn calls — the OS Face ID/Touch ID/Windows Hello prompt genuinely
// appears if a platform authenticator is set up. There is no backend to issue
// challenges or verify signatures, though, so this proves the interaction
// works, not that it's cryptographically secure end-to-end. A real
// integration needs a server generating the challenge and verifying the
// attestation/assertion — wiring that up is a backend task, not a frontend one.
export async function enrollBiometric(): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'ScoreWise' },
        user: { id: userId, name: 'scorewise-user', displayName: 'ScoreWise user' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    if (!credential) return false;
    localStorage.setItem(BIOMETRIC_CRED_KEY, bufferToBase64url(credential.rawId));
    return true;
  } catch {
    return false;
  }
}

export async function verifyBiometric(): Promise<boolean> {
  const credId = localStorage.getItem(BIOMETRIC_CRED_KEY);
  if (!credId) return false;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: base64urlToBuffer(credId) as BufferSource, type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}
