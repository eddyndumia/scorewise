import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinKeypad } from '../../components/PinKeypad/PinKeypad';
import { FingerprintIcon } from '../../components/FingerprintIcon';
import { Logo } from '../../components/Logo';
import {
  checkPin,
  setUnlocked,
  hasBiometric,
  verifyBiometric,
  clearAll,
  getPinLockoutRemainingMs,
  recordPinFailure,
  clearPinFailures,
} from '../../lib/session';
import styles from './PinEntry.module.css';

function formatLockout(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.ceil(seconds / 60)}m`;
}

export function PinEntry() {
  const [pin, setPinValue] = useState('');
  const [error, setError] = useState('');
  const [lockoutMs, setLockoutMs] = useState(() => getPinLockoutRemainingMs());
  const navigate = useNavigate();
  const biometricEnrolled = hasBiometric();
  const locked = lockoutMs > 0;

  const unlock = () => {
    clearPinFailures();
    setUnlocked();
    navigate('/home');
  };

  const handleBiometric = async () => {
    const ok = await verifyBiometric();
    if (ok) unlock();
    else setError('Biometric authentication failed — use your PIN instead.');
  };

  // Offer biometric immediately on arrival, so it doesn't require an extra tap.
  useEffect(() => {
    if (biometricEnrolled && !locked) {
      handleBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick the lockout countdown once a second while active.
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => {
      const remaining = getPinLockoutRemainingMs();
      setLockoutMs(remaining);
      if (remaining === 0) setError('');
    }, 1000);
    return () => clearInterval(id);
  }, [locked]);

  useEffect(() => {
    if (pin.length === 4) {
      if (locked) {
        setPinValue('');
        return;
      }
      if (checkPin(pin)) {
        unlock();
      } else {
        recordPinFailure();
        const remaining = getPinLockoutRemainingMs();
        setLockoutMs(remaining);
        setError(remaining > 0 ? `Too many attempts — try again in ${formatLockout(remaining)}.` : 'Incorrect PIN — try again.');
        setTimeout(() => setPinValue(''), 400);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleReset = () => {
    clearAll();
    navigate('/');
  };

  return (
    <div className={styles.screen}>
      <div style={{ marginBottom: 16 }}>
        <Logo size={22} />
      </div>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Enter your PIN to unlock ScoreWise.</p>
      <p className={styles.errorText}>{error}</p>
      <PinKeypad value={pin} onChange={setPinValue} error={!!error} disabled={locked} />

      {biometricEnrolled && !locked && (
        <button className={styles.biometricBtn} onClick={handleBiometric}>
          <FingerprintIcon size={16} />
          Use Face ID / Touch ID
        </button>
      )}

      <button className={styles.resetLink} onClick={handleReset}>
        Forgot PIN? Reset account
      </button>
    </div>
  );
}
