import { useState } from 'react';
import { TrendSparkline } from '../TrendSparkline/TrendSparkline';
import { formatKes } from '../../lib/formatCurrency';
import type { CashFlowPoint } from '../../api/cashFlow';
import styles from './CashFlowChart.module.css';

type Mode = 'in' | 'out';

export function CashFlowChart({ series }: { series: CashFlowPoint[] }) {
  const [mode, setMode] = useState<Mode>('in');

  if (series.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.emptyState}>Not enough transactions yet to chart money in and out.</p>
      </div>
    );
  }

  const values = series.map((p) => (mode === 'in' ? p.totalIn : p.totalOut));
  const total = values.reduce((sum, v) => sum + v, 0);
  const color = mode === 'in' ? 'var(--green)' : 'var(--coral)';

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.label}>money {mode}</p>
          <p className={`${styles.amount} num`}>{formatKes(total)}</p>
        </div>
        <div className={styles.toggle}>
          <button
            className={[styles.toggleOption, mode === 'in' ? styles.toggleOptionActiveIn : ''].join(' ')}
            onClick={() => setMode('in')}
          >
            In
          </button>
          <button
            className={[styles.toggleOption, mode === 'out' ? styles.toggleOptionActiveOut : ''].join(' ')}
            onClick={() => setMode('out')}
          >
            Out
          </button>
        </div>
      </div>
      <TrendSparkline points={values} color={color} height={50} />
    </div>
  );
}
