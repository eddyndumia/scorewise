import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Logo } from '../../components/Logo';
import styles from './Onboarding.module.css';

export function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <div className={styles.badge}>
          <Logo size={40} />
        </div>
      </div>

      <div className={styles.body}>
        <h1 className={styles.wordmark}>scorewise</h1>
        <p className={styles.tagline}>Your M-Pesa history, decoded into a credit score you actually understand.</p>

        <div className={styles.spacer} />

        <div className={styles.cta}>
          <Button variant="primary" iconRight="→" onClick={() => navigate('/signup')}>
            Get started
          </Button>
        </div>
      </div>
    </div>
  );
}
