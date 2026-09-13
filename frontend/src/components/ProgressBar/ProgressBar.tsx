import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  /** 0-1 fraction for a determinate bar. Omit (or leave undefined) for an
   * indeterminate sweep — use that when there's no real progress signal to
   * report (e.g. the server is still working after the upload itself
   * finished), rather than faking a percentage that isn't real. */
  fraction?: number;
}

export function ProgressBar({ fraction }: ProgressBarProps) {
  const determinate = fraction !== undefined;
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={determinate ? Math.round(fraction * 100) : undefined}>
      <div
        className={determinate ? styles.fillDeterminate : styles.fillIndeterminate}
        style={determinate ? { width: `${Math.round(fraction * 100)}%` } : undefined}
      />
    </div>
  );
}
