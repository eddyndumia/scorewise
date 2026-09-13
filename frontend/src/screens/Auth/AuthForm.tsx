import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { TextField } from '../../components/TextField/TextField';
import { Logo } from '../../components/Logo';
import { GoogleIcon, AppleIcon } from './icons';
import { hasPin } from '../../lib/session';
import { signUp, logIn } from '../../api/auth';
import { NetworkError } from '../../api/client';
import { setCachedAccount } from '../../lib/authSession';
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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const canSubmit = email.includes('@') && email.includes('.') && password.length >= minPasswordLength;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setCachedAccount(true);
        navigate('/terms');
      } else {
        await logIn(email, password);
        setCachedAccount(true);
        navigate(hasPin() ? '/pin-entry' : '/pin-setup');
      }
    } catch (e) {
      if (e instanceof NetworkError) {
        setError("Couldn't reach the server — it may be waking up after being idle. Please try again in a moment.");
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Google/Apple are UI stubs — no real OAuth wired up yet, so they're
  // deliberately not connected to signUp/logIn (which need a real
  // email/password). See the project CLAUDE.md.
  const handleSocialStub = () => {
    setError('Social sign-in is not available yet — please use email and password.');
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
          error={error || undefined}
        />
        <Button variant="primary" disabled={!canSubmit || submitting} iconRight="→" onClick={handleSubmit}>
          {submitting ? 'Please wait…' : submitLabel}
        </Button>

        <div className={styles.divider}>or</div>

        <Button variant="social" iconLeft={<GoogleIcon />} onClick={handleSocialStub}>
          {socialVerb} with Google
        </Button>
        <Button variant="social" iconLeft={<AppleIcon />} onClick={handleSocialStub}>
          {socialVerb} with Apple
        </Button>
      </div>

      <p className={styles.switchLine}>
        {switchText} <Link to={switchTo}>{switchLinkLabel}</Link>
      </p>
    </div>
  );
}
