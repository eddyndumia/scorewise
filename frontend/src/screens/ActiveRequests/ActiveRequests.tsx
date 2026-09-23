import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpiryBadge } from '../../components/ExpiryBadge/ExpiryBadge';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import { useRequests } from '../../context/RequestsContext';
import { formatCountdown } from '../../lib/formatCountdown';
import styles from './ActiveRequests.module.css';

function useNow(intervalMs: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function ActiveRequests() {
  const { grants, pendingConsents, revokeGrant, simulateIncoming, refresh, refreshPending } = useRequests();
  const navigate = useNavigate();
  const now = useNow(30_000);

  // The shared context only fetches once at app load (often before login),
  // so pick up grants and lender requests that arrived since then.
  useEffect(() => {
    Promise.all([refresh(), refreshPending()]).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Active requests</h1>

      {pendingConsents.length > 0 && (
        <>
          <p className={styles.sectionLabel}>Waiting for your response</p>
          <div className={styles.list} style={{ marginBottom: 20 }}>
            {pendingConsents.map((request) => (
              <button key={request.id} className={styles.pendingRow} onClick={() => navigate(`/consent/${request.id}`)}>
                <span className={styles.lenderName}>{request.lenderName}</span>
                <span className={styles.reviewLink}>Review →</span>
              </button>
            ))}
          </div>
        </>
      )}

      <p className={styles.sectionLabel}>Currently have access</p>
      {grants.length === 0 ? (
        <p className={styles.empty}>No lenders currently have access to your data.</p>
      ) : (
        <div className={styles.list}>
          {grants.map((grant) => (
            <div key={grant.id} className={styles.row}>
              <div className={styles.lenderInfo}>
                <span className={styles.lenderName}>{grant.lenderName}</span>
                <ExpiryBadge label={`Expires in ${formatCountdown(grant.expiresAt - now)}`} />
              </div>
              <button className={styles.revokeBtn} onClick={() => revokeGrant(grant.id)}>
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={styles.demoLink} onClick={simulateIncoming}>
        + Simulate an incoming request
      </button>

      <div style={{ marginTop: 'auto' }}>
        <BottomNav />
      </div>
    </div>
  );
}
