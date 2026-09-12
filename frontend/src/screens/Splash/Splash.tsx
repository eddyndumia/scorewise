import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { hasAccount, hasPin, isUnlocked } from '../../lib/session';
import styles from './Splash.module.css';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
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
