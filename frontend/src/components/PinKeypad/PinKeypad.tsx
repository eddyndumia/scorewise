import styles from './PinKeypad.module.css';

interface PinKeypadProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PinKeypad({ value, onChange, length = 4, error = false, disabled = false }: PinKeypadProps) {
  const handleKey = (key: string) => {
    if (disabled || key === '') return;
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= length) return;
    onChange(value + key);
  };

  return (
    <div style={disabled ? { opacity: 0.4 } : undefined}>
      <div className={styles.dots}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={[styles.dot, i < value.length ? styles.filled : '', i < value.length && error ? styles.errorDot : ''].join(' ')}
          />
        ))}
      </div>
      <div className={styles.grid}>
        {KEYS.map((key, i) => (
          <button
            key={i}
            className={styles.key}
            style={key === '' ? { visibility: 'hidden' } : undefined}
            onClick={() => handleKey(key)}
            disabled={disabled}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
