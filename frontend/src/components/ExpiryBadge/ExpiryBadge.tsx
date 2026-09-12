import styles from './ExpiryBadge.module.css';

export function ExpiryBadge({ label }: { label: string }) {
  return <span className={styles.badge}>{label}</span>;
}
