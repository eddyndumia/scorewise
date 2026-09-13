import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { BASE_URL } from '../../api/client';
import { hasAccount, hasPin, isUnlocked } from '../../lib/session';
import styles from './Splash.module.css';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire-and-forget: the backend's free-tier host can be asleep after 15
    // min idle and take 30-60s to wake. Pinging it now, while this screen's
    // own branded pause is showing anyway, gives it a head start before the
    // user reaches a real request (login/signup, statement upload).
    fetch(`${BASE_URL}/health`).catch(() => {});

    const id = setTimeout(() => {
      if (!hasAccount()) navigate('/onboarding', { replace: true });
      else if (!hasPin()) navigate('/pin-setup', { replace: true });
      else if (isUnlocked()) navigate('/home', { replace: true });
      else navigate('/pin-entry', { replace: true });
    }, 900);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <div className={styles.screen}>
      <Logo size={48} />
      <h1 className={styles.wordmark}>scorewise</h1>
    </div>
  );
}
