import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { hasAccount, hasPin, isUnlocked } from '../lib/session';

// Splash only decides where to land once, on initial app load — it can't stop
// someone from navigating straight to /home via the URL bar, a bookmark, or
// the browser back button after locking. This re-checks on every render of a
// protected route, which is what actually makes the PIN a gate rather than a
// suggestion.
export function RequireUnlocked({ children }: { children: ReactElement }) {
  if (!hasAccount()) return <Navigate to="/onboarding" replace />;
  if (!hasPin()) return <Navigate to="/pin-setup" replace />;
  if (!isUnlocked()) return <Navigate to="/pin-entry" replace />;
  return children;
}

// Statement Upload/Review are reachable two ways: mid-signup, before an
// account exists yet (Terms -> here -> PinSetup), or later as an already-
// unlocked action from Home. RequireUnlocked's "no account -> onboarding"
// redirect wrongly kicked a brand-new signup back to the start here — this
// only blocks a genuinely *locked* existing account, not someone still
// registering.
export function RequireUnlockedOrRegistering({ children }: { children: ReactElement }) {
  if (hasAccount() && hasPin() && !isUnlocked()) return <Navigate to="/pin-entry" replace />;
  return children;
}
