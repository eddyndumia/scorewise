import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import styles from './StatementInstructions.module.css';

type Method = 'app' | 'ussd';

const APP_STEPS = [
  'Open the Safaricom app (My Safaricom / My OneApp) and log in with your PIN or biometrics.',
  'Tap "Statements" or "Transaction History".',
  'Choose a date range — 7 days, 30 days, 3 months, or a custom range.',
  'Tap "Download PDF" or "Email Statement".',
];

const USSD_STEPS = [
  'Dial *334# on your registered Safaricom line.',
  'Select "My Account".',
  'Select "M-PESA Statement", then "Request Statement".',
  'Choose a full statement for the period you want — it\'s free, and gets emailed to you as a PDF.',
];

export function StatementInstructions() {
  const [method, setMethod] = useState<Method>('app');
  const navigate = useNavigate();
  const steps = method === 'app' ? APP_STEPS : USSD_STEPS;

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Get your M-Pesa statement</h1>
      <p className={styles.subtitle}>You'll need this PDF on hand for the next step. Pick whichever way is easiest.</p>

      <div className={styles.tabs}>
        <button className={[styles.tab, method === 'app' ? styles.tabActive : ''].join(' ')} onClick={() => setMethod('app')}>
          Using the app
        </button>
        <button className={[styles.tab, method === 'ussd' ? styles.tabActive : ''].join(' ')} onClick={() => setMethod('ussd')}>
          Using *334#
        </button>
      </div>

      <div className={styles.stepList}>
        {steps.map((step, i) => (
          <div key={step} className={styles.step}>
            <span className={styles.stepNumber}>{i + 1}</span>
            <span className={styles.stepText}>{step}</span>
          </div>
        ))}
      </div>

      <div className={styles.passwordNote}>
        <p className={styles.passwordNoteTitle}>About the statement password</p>
        <p className={styles.passwordNoteBody}>
          Safaricom sometimes sends the password as a one-time code by SMS, and sometimes it's your National ID
          number instead — it depends on how your statement was generated. Try the SMS code first; if you didn't get
          one, use your ID number.
        </p>
      </div>

      <div className={styles.footer}>
        <Button variant="primary" iconRight="→" onClick={() => navigate('/statement-upload')}>
          I have my statement
        </Button>
      </div>
    </div>
  );
}
