import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScore, getSimulateLimits, simulateScore, type SimulateLimits } from '../../api/score';
import { formatKes } from '../../lib/formatCurrency';
import type { ScoreResult } from '../../lib/scoring';
import styles from './ScoreSimulator.module.css';

// Debounced so dragging a slider doesn't fire a request per pixel — this hits
// the real backend scoring logic (app/scoring.py's apply_hypothetical), not a
// client-side guess, so the projection is exactly what a real statement with
// these numbers would score.
const DEBOUNCE_MS = 250;

export function ScoreSimulator() {
  const navigate = useNavigate();
  const [limits, setLimits] = useState<SimulateLimits | null>(null);
  const [currentScore, setCurrentScore] = useState<ScoreResult | null>(null);
  const [projected, setProjected] = useState<ScoreResult | null>(null);
  const [extraSavings, setExtraSavings] = useState(0);
  const [fulizaReductionDays, setFulizaReductionDays] = useState(0);
  const [extraOnTimePayments, setExtraOnTimePayments] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getScore().then(setCurrentScore);
    getSimulateLimits().then(setLimits);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      simulateScore({ extraSavings, fulizaReductionDays, extraOnTimePayments }).then(setProjected);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [extraSavings, fulizaReductionDays, extraOnTimePayments]);

  const reset = () => {
    setExtraSavings(0);
    setFulizaReductionDays(0);
    setExtraOnTimePayments(0);
  };

  if (!limits || !currentScore) {
    return (
      <div className={styles.screen}>
        <p className={styles.loading}>Loading your current numbers…</p>
      </div>
    );
  }

  const savingsCap = Math.max(2000, Math.round((limits.totalIncome * 0.5) / 500) * 500);
  const displayScore = projected?.score ?? currentScore.score;
  const deltaVsReal = displayScore - currentScore.score;
  const isUp = deltaVsReal >= 0;
  const hasAdjustments = extraSavings > 0 || fulizaReductionDays > 0 || extraOnTimePayments > 0;

  return (
    <div className={styles.screen}>
      <button className={styles.backRow} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className={styles.title}>What if?</h1>
      <p className={styles.subtitle}>See how changes to your habits could affect your score — based on your real numbers, not a guess.</p>

      <div className={styles.projectedCard}>
        <p className={styles.projectedLabel}>projected score</p>
        <div className={styles.projectedRow}>
          <p className={`${styles.projectedScore} num`}>{displayScore}</p>
          {hasAdjustments && (
            <span
              className={styles.projectedDelta}
              style={{
                background: isUp ? 'var(--green-light)' : 'var(--coral-light)',
                color: isUp ? 'var(--green)' : 'var(--coral)',
              }}
            >
              {isUp ? '+' : ''}
              {deltaVsReal} vs. today
            </span>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.control}>
          <label className={styles.controlLabel}>
            <span>Save an extra this period</span>
            <span className={styles.controlValue}>{formatKes(extraSavings)}</span>
          </label>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={savingsCap}
            step={500}
            value={extraSavings}
            onChange={(e) => setExtraSavings(Number(e.target.value))}
          />
        </div>

        <div className={styles.control}>
          <label className={styles.controlLabel}>
            <span>Cut Fuliza usage by</span>
            <span className={styles.controlValue}>
              {fulizaReductionDays} day{fulizaReductionDays === 1 ? '' : 's'}
            </span>
          </label>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={limits.fulizaDaysActive}
            step={1}
            value={fulizaReductionDays}
            onChange={(e) => setFulizaReductionDays(Number(e.target.value))}
            disabled={limits.fulizaDaysActive === 0}
          />
          {limits.fulizaDaysActive === 0 && <p className={styles.disabledNote}>You're not currently using Fuliza.</p>}
        </div>

        <div className={styles.control}>
          <label className={styles.controlLabel}>
            <span>Fix late/missed payments</span>
            <span className={styles.controlValue}>
              {extraOnTimePayments} of {limits.latePlusMissed}
            </span>
          </label>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={limits.latePlusMissed}
            step={1}
            value={extraOnTimePayments}
            onChange={(e) => setExtraOnTimePayments(Number(e.target.value))}
            disabled={limits.latePlusMissed === 0}
          />
          {limits.latePlusMissed === 0 && <p className={styles.disabledNote}>No late or missed payments to fix — nice.</p>}
        </div>
      </div>

      {hasAdjustments && (
        <button className={styles.resetLink} onClick={reset}>
          Reset
        </button>
      )}
    </div>
  );
}
