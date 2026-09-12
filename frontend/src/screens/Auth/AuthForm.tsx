import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { TextField } from '../../components/TextField/TextField';
import { Logo } from '../../components/Logo';
import { GoogleIcon, AppleIcon } from './icons';
import { hasPin } from '../../lib/session';
import styles from './Auth.module.css';

interface AuthFormProps {
  tagline: string;
  submitLabel: string;
  socialVerb: string;
  minPasswordLength: number;
  passwordPlaceholder: string;
  switchText: string;
  switchLinkLabel: string;
  switchTo: string;
  /** Sign up goes through terms + statement upload; log in unlocks an existing account. */
  isSignUp: boolean;
}

export function AuthForm({
  tagline,
  submitLabel,
  socialVerb,
  minPasswordLength,
  passwordPlaceholder,
  switchText,
  switchLinkLabel,
  switchTo,
  isSignUp,
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const canSubmit = email.includes('@') && email.includes('.') && password.length >= minPasswordLength;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // No backend yet — this is the mock auth flow. Sign up is a brand-new
    // account, so it goes through terms + statement upload; log in is a
    // returning session that just needs unlocking.
    if (isSignUp) {
      navigate('/terms');
    } else {
      navigate(hasPin() ? '/pin-entry' : '/pin-setup');
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <Logo size={22} />
        <h1 className={styles.wordmark}>scorewise</h1>
      </div>
      <p className={styles.tagline}>{tagline}</p>

      <div className={styles.form}>
        <TextField
          label="Your email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Choose a password"
          type="password"
          placeholder={passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="primary" disabled={!canSubmit} iconRight="→" onClick={handleSubmit}>
          {submitLabel}
        </Button>

        <div className={styles.divider}>or</div>

        <Button variant="social" iconLeft={<GoogleIcon />} onClick={handleSubmit}>
          {socialVerb} with Google
        </Button>
        <Button variant="social" iconLeft={<AppleIcon />} onClick={handleSubmit}>
          {socialVerb} with Apple
        </Button>
      </div>

      <p className={styles.switchLine}>
        {switchText} <Link to={switchTo}>{switchLinkLabel}</Link>
      </p>
    </div>
  );
}
