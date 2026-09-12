import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { ExpiryBadge } from '../../components/ExpiryBadge/ExpiryBadge';
import { useRequests } from '../../context/RequestsContext';
import { getPendingConsentRequest, respondToConsent, type PendingConsentRequest } from '../../api/consent';
import styles from './ConsentRequest.module.css';

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5 5L20 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function ConsentRequest() {
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const { refresh, refreshPending } = useRequests();
  const [request, setRequest] = useState<PendingConsentRequest | null>(null);

  useEffect(() => {
    if (!requestId) return;
    getPendingConsentRequest(requestId).then(setRequest);
  }, [requestId]);

  if (!request) return null;

  const handleAllow = async () => {
    await respondToConsent(request.id, true);
    await Promise.all([refresh(), refreshPending()]);
    navigate('/requests');
  };

  const handleDeny = async () => {
    await respondToConsent(request.id, false);
    await refreshPending();
    navigate('/requests');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.lenderName}>{request.lenderName}</h1>
        <p className={styles.headerSub}>wants access to your credit profile</p>
      </div>

      <p className={styles.sectionTitle}>Will be shared</p>
      <div className={styles.list}>
        {request.willShare.map((item) => (
          <div key={item} className={`${styles.row} ${styles.willRow}`}>
            <CheckIcon />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <p className={styles.sectionTitle}>Won't be shared</p>
      <div className={styles.list}>
        {request.wontShare.map((item) => (
          <div key={item} className={`${styles.row} ${styles.wontRow}`}>
            <XIcon />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className={styles.expiryRow}>
        <ExpiryBadge label={`Access expires ${request.grantDurationDays} days after approval`} />
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleDeny}>
          Deny
        </Button>
        <Button variant="primary" onClick={handleAllow}>
          Allow
        </Button>
      </div>
    </div>
  );
}
