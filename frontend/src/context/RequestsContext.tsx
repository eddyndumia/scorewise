import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getActiveGrants, revokeAccess, type ActiveGrantDTO } from '../api/requests';
import { getPendingConsentRequests, simulateIncomingRequest, type PendingConsentRequest } from '../api/consent';

export type ActiveGrant = ActiveGrantDTO;

interface RequestsContextValue {
  grants: ActiveGrant[];
  pendingConsents: PendingConsentRequest[];
  loading: boolean;
  refresh: () => Promise<void>;
  refreshPending: () => Promise<void>;
  revokeGrant: (id: string) => Promise<void>;
  simulateIncoming: () => Promise<void>;
}

const RequestsContext = createContext<RequestsContextValue | null>(null);

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [grants, setGrants] = useState<ActiveGrant[]>([]);
  const [pendingConsents, setPendingConsents] = useState<PendingConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const g = await getActiveGrants();
    setGrants(g);
  };

  const refreshPending = async () => {
    const p = await getPendingConsentRequests();
    setPendingConsents(p);
  };

  // This provider mounts before login, so the first fetch 401s for a
  // logged-out visitor. Screens that read this data call refresh() and
  // refreshPending() themselves on mount, so a failure here just means empty.
  useEffect(() => {
    Promise.all([refresh(), refreshPending()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revokeGrant = async (id: string) => {
    await revokeAccess(id);
    setGrants((prev) => prev.filter((g) => g.id !== id));
  };

  const simulateIncoming = async () => {
    await simulateIncomingRequest();
    await refreshPending();
  };

  return (
    <RequestsContext.Provider value={{ grants, pendingConsents, loading, refresh, refreshPending, revokeGrant, simulateIncoming }}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider');
  return ctx;
}
