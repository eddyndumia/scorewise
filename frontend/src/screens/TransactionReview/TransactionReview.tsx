import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { classifyStatement } from '../../api/statements';
import type { AmbiguousGroup } from '../../api/statements';
import { hasPin } from '../../lib/session';
import { formatKes } from '../../lib/formatCurrency';
import styles from './TransactionReview.module.css';

interface LocationState {
  sessionId: string;
  groups: AmbiguousGroup[];
}

export function TransactionReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state) {
    navigate('/statement-upload', { replace: true });
    return null;
  }

  const { sessionId, groups } = state;
  const allAnswered = groups.every((g) => answers[g.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await classifyStatement(
        sessionId,
        groups.map((g) => ({ groupId: g.id, isRepayment: answers[g.id] })),
      );
      navigate(hasPin() ? '/home' : '/pin-setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your answers.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>A few payments we're not sure about</h1>
      <p className={styles.subtitle}>
        These went to banks or paybills we can't automatically tell are loan repayments. Let us know so your score
        reflects them correctly.
      </p>

      <div className={styles.list}>
        {groups.map((g) => {
          const answer = answers[g.id];
          return (
            <div key={g.id} className={styles.card}>
              <p className={styles.businessName}>{g.businessName}</p>
              <p className={styles.meta}>
                {g.count} payment{g.count === 1 ? '' : 's'} · {formatKes(g.totalAmount)} total
              </p>
              <div className={styles.choices}>
                <button
                  className={`${styles.choiceBtn} ${answer === true ? styles.selectedYes : ''}`}
                  onClick={() => setAnswers((prev) => ({ ...prev, [g.id]: true }))}
                >
                  Loan repayment
                </button>
                <button
                  className={`${styles.choiceBtn} ${answer === false ? styles.selectedNo : ''}`}
                  onClick={() => setAnswers((prev) => ({ ...prev, [g.id]: false }))}
                >
                  Not a loan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <Button variant="primary" disabled={!allAnswered || submitting} onClick={handleSubmit}>
          {submitting ? 'Saving…' : 'Continue'}
        </Button>
        {error && <p style={{ color: 'var(--coral)', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
