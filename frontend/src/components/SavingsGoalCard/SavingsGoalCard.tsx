import { useEffect, useState } from 'react';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { getSavingsGoal, setSavingsGoal, clearSavingsGoal, type SavingsGoalStatus } from '../../api/savingsGoal';
import { formatKes } from '../../lib/formatCurrency';
import styles from './SavingsGoalCard.module.css';

export function SavingsGoalCard() {
  const [status, setStatus] = useState<SavingsGoalStatus | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getSavingsGoal().then(setStatus);

  useEffect(() => {
    load();
  }, []);

  const openSheet = () => {
    setDraft(status?.goal ? String(status.goal.targetAmount) : '');
    setSheetOpen(true);
  };

  const handleSave = async () => {
    const amount = Number(draft);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await setSavingsGoal(amount);
      await load();
      setSheetOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await clearSavingsGoal();
      await load();
      setSheetOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!status) return null;

  const { goal, savedSoFar } = status;
  const pct = goal ? Math.min(100, Math.round((savedSoFar / goal.targetAmount) * 100)) : 0;

  return (
    <>
      <div className={styles.card}>
        {goal ? (
          <>
            <div className={styles.headerRow}>
              <p className={styles.label}>savings goal · this period</p>
              <button className={styles.editLink} onClick={openSheet}>
                Edit
              </button>
            </div>
            <div className={styles.amounts}>
              <span className={`${styles.savedAmount} num`}>{formatKes(savedSoFar)}</span>
              <span className={styles.targetAmount}>of {formatKes(goal.targetAmount)} ({pct}%)</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <div className={styles.ctaRow}>
            <p className={styles.ctaText}>No savings goal set for this period yet.</p>
            <button className={styles.ctaButton} onClick={openSheet}>
              Set a goal
            </button>
          </div>
        )}
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <p className={styles.sheetTitle}>{goal ? 'Edit savings goal' : 'Set a savings goal'}</p>
        <p className={styles.sheetSubtitle}>How much do you want to save this period?</p>
        <input
          className={styles.sheetInput}
          type="number"
          inputMode="numeric"
          placeholder="e.g. 20000"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className={styles.sheetActions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !draft || Number(draft) <= 0}>
            Save
          </button>
          {goal && (
            <button className={styles.removeBtn} onClick={handleRemove} disabled={saving}>
              Remove goal
            </button>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
