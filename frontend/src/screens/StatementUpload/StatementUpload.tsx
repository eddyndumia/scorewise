import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { TextField } from '../../components/TextField/TextField';
import { FileUploadField } from '../../components/FileUploadField/FileUploadField';
import { uploadStatement, StatementApiError } from '../../api/statements';
import { hasPin } from '../../lib/session';
import styles from './StatementUpload.module.css';

interface NameMismatch {
  expectedName: string;
  foundName: string;
}

export function StatementUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState<NameMismatch | null>(null);
  const navigate = useNavigate();

  // Reaching this screen with no PIN yet means it's the mandatory upload step
  // during signup, not the "No Daraja yet?" fallback link from an existing Home.
  const isRegistrationStep = !hasPin();
  const nextRoute = isRegistrationStep ? '/pin-setup' : '/home';

  const canSubmit = file !== null && status === 'idle';

  const resetFile = () => {
    setFile(null);
    setMismatch(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !file) return;
    setStatus('processing');
    setError(null);
    setMismatch(null);
    try {
      const result = await uploadStatement(file, password);
      if (result.status === 'needs_review') {
        navigate('/statement-review', { state: { sessionId: result.sessionId, groups: result.groups } });
        return;
      }
      navigate(nextRoute);
    } catch (e) {
      if (e instanceof StatementApiError && e.code === 'name_mismatch') {
        setMismatch({ expectedName: e.extra.expectedName as string, foundName: e.extra.foundName as string });
      } else {
        setError(e instanceof Error ? e.message : 'Could not process this statement.');
      }
      setStatus('idle');
    }
  };

  if (mismatch) {
    return (
      <div className={styles.screen}>
        <h1 className={styles.title}>This doesn't look like your statement</h1>
        <p className={styles.subtitle}>
          Your account is registered to <strong>{mismatch.expectedName}</strong>, but this statement belongs to{' '}
          <strong>{mismatch.foundName}</strong>. For your security, we only accept statements that match the name on
          your account.
        </p>
        <div className={styles.form}>
          <Button variant="primary" onClick={resetFile}>
            Upload a different statement
          </Button>
          <Button variant="secondary" onClick={() => navigate(isRegistrationStep ? '/terms' : '/home')}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{isRegistrationStep ? 'Upload your first statement' : 'Upload a statement'}</h1>
      <p className={styles.subtitle}>
        {isRegistrationStep
          ? 'This computes your score and sets up your account.'
          : 'Use this until your M-Pesa account is connected automatically.'}
      </p>

      {isRegistrationStep && (
        <div className={styles.nameNotice}>
          The name on this statement will become your account name. Future statements you upload must match it, so
          make sure this is your own M-Pesa statement.
        </div>
      )}

      <div className={styles.form}>
        <FileUploadField fileName={file?.name ?? null} onFileSelect={setFile} />
        <TextField
          label="Statement password"
          type="password"
          placeholder="PDF password, if any"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          {status === 'processing' ? 'Processing…' : 'Calculate my score'}
        </Button>
        {status === 'processing' && <p className={styles.statusText}>Reading your statement — this stays on your device.</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {isRegistrationStep && status === 'idle' && (
          <button className={styles.skipLink} onClick={() => navigate('/pin-setup')}>
            Skip for now — use a demo score
          </button>
        )}
      </div>
    </div>
  );
}
