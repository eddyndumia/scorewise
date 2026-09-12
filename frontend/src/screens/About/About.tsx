import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import styles from './About.module.css';

// Not formal partnerships — these are the lenders/banks the statement classifier
// currently recognizes by name (see scorewise-backend/app/pdf_parser.py
// REPAYMENT_KEYWORDS). Worded honestly below rather than as "partners."
const RECOGNIZED_LENDERS = [
  'SACCOs (any, by name)',
  'Tala',
  'Branch',
  'Zenka',
  'Timiza',
  'OKash',
  'Mogo',
  'KCB',
  'Equity Bank',
  'Co-operative Bank',
  'NCBA',
  'Absa',
];

export function About() {
  const navigate = useNavigate();

  return (
    <div className={styles.screen}>
      <button className={styles.backRow} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.header}>
        <Logo size={40} />
        <p className={styles.wordmark}>scorewise</p>
        <p className={styles.version}>Version 0.1.0 (prototype)</p>
      </div>

      <p className={styles.description}>
        ScoreWise turns your own M-Pesa transaction history into a credit score you can understand and choose to
        share — without needing a bank account or a formal credit history.
      </p>

      <p className={styles.sectionLabel}>Recognized lenders</p>
      <div className={styles.lenderCard}>
        <p className={styles.lenderNote}>
          These are the lenders and banks our statement classifier can currently recognize by name — not formal
          partnerships. Payments to a SACCO or any of these show up correctly in your repayment signal; others may
          not be recognized yet.
        </p>
        <div className={styles.lenderList}>
          {RECOGNIZED_LENDERS.map((lender) => (
            <span key={lender} className={styles.lenderChip}>
              {lender}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
