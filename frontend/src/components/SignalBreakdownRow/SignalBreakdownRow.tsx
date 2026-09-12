import { RingProgress } from '../RingProgress/RingProgress';
import { StatusPill } from '../StatusPill/StatusPill';
import { statusColors, type SignalStatus } from '../../theme/tokens';
import styles from './SignalBreakdownRow.module.css';

// Shared with the B2B applicant-detail view — keep this component self-contained
// (no screen-specific styling, no app-specific imports) so it can be lifted into
// a shared package later without changes.
export interface SignalBreakdownRowProps {
  /** 0-100 */
  value: number;
  label: string;
  explanation: string;
  status: SignalStatus;
}

export function SignalBreakdownRow({ value, label, explanation, status }: SignalBreakdownRowProps) {
  const { text } = statusColors[status];

  return (
    <div className={styles.row}>
      <RingProgress value={value} color={text} size={40} strokeWidth={4} />
      <div className={styles.text}>
        <div className={styles.labelLine}>
          <span className={styles.label}>{label}</span>
          <StatusPill status={status} />
        </div>
        <p className={styles.explanation}>{explanation}</p>
      </div>
    </div>
  );
}
