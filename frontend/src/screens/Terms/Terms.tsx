import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { setAcceptedTerms } from '../../lib/session';
import { termsSections } from './termsContent';
import styles from './Terms.module.css';

export function Terms() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const viewOnly = (location.state as { viewOnly?: boolean } | null)?.viewOnly ?? false;

  const handleContinue = () => {
    if (!accepted) return;
    setAcceptedTerms();
    navigate('/statement-instructions');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terms & Conditions</h1>
        <p className={styles.disclaimer}>
          Demo build: this text is a placeholder and has not been reviewed by a lawyer. It is not a substitute for
          real legal terms.
        </p>
      </div>

      <div className={styles.content}>
        {termsSections.map((section) => (
          <div key={section.title} className={styles.section}>
            <p className={styles.sectionTitle}>{section.title}</p>
            <p className={styles.sectionBody}>{section.body}</p>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        {viewOnly ? (
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Close
          </Button>
        ) : (
          <>
            <div className={styles.checkboxRow} onClick={() => setAccepted((v) => !v)}>
              <div className={[styles.checkbox, accepted ? styles.checkboxChecked : ''].join(' ')}>
                {accepted && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12.5l5 5L20 7" />
                  </svg>
                )}
              </div>
              <span className={styles.checkboxLabel}>I have read and agree to the Terms & Conditions and Privacy Policy.</span>
            </div>
            <Button variant="primary" disabled={!accepted} onClick={handleContinue}>
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
