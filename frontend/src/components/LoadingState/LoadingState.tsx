import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message: string;
}

/** Shared full-area loading text, extracted from ScoreSimulator's original
 * pattern — the one screen that already got this right (a message instead
 * of a blank screen while its initial fetch resolves). Use this instead of
 * `return null`/an empty field wherever a screen's first render depends on
 * data from the backend. */
export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className={styles.screen}>
      <p className={styles.loading}>{message}</p>
    </div>
  );
}
