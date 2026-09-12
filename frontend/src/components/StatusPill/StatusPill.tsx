import { statusColors, type SignalStatus } from '../../theme/tokens';
import styles from './StatusPill.module.css';

interface StatusPillProps {
  status: SignalStatus;
  label?: string;
}

export function StatusPill({ status, label = status }: StatusPillProps) {
  const { bg, text } = statusColors[status];
  return (
    <span className={styles.pill} style={{ background: bg, color: text }}>
      {label}
    </span>
  );
}
