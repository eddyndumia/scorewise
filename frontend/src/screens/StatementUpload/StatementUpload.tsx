import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { TextField } from '../../components/TextField/TextField';
import { FileUploadField } from '../../components/FileUploadField/FileUploadField';
import { uploadStatement, StatementApiError } from '../../api/statements';
import { NetworkError } from '../../api/client';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { hasPin } from '../../lib/session';
import styles from './StatementUpload.module.css';

// How long to wait before naming the cold-start possibility, rather than
// leaving the user staring at "Processing…" with no explanation. Render's
// free tier can take 30-60s to wake from idle, well past what feels like a
// stalled request if nothing on screen says why.
const SLOW_UPLOAD_HINT_MS = 7000;

interface NameMismatch {
  expectedName: string;
  foundName: string;
}

export function StatementUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing'>('idle');
  // Real fraction of the file's bytes sent so far (from the browser's own
  // upload-progress event, not a guess). null until the request starts.
  // 1 means the upload itself is done and the server is now parsing — at
  // that point there's no further real progress signal, so the bar switches
  // to an indeterminate sweep rather than faking a percentage.
  const [uploadFraction, setUploadFraction] = useState<number | null>(null);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState<NameMismatch | null>(null);
  const navigate = useNavigate();
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setSlow(false);
    setUploadFraction(0);
    setError(null);
    setMismatch(null);
    slowTimer.current = setTimeout(() => setSlow(true), SLOW_UPLOAD_HINT_MS);
    try {
      const result = await uploadStatement(file, password, setUploadFraction);
      if (result.status === 'needs_review') {
        navigate('/statement-review', { state: { sessionId: result.sessionId, groups: result.groups } });
        return;
      }
      navigate(nextRoute);
    } catch (e) {
      if (e instanceof StatementApiError && e.code === 'name_mismatch') {
        setMismatch({ expectedName: e.extra.expectedName as string, foundName: e.extra.foundName as string });
      } else if (e instanceof NetworkError) {
        setError("Couldn't reach the server — it may be waking up after being idle. Please try again in a moment.");
      } else {
        setError(e instanceof Error ? e.message : 'Could not process this statement.');
      }
      setStatus('idle');
    } finally {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setSlow(false);
      setUploadFraction(null);
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
        {status === 'processing' && (
          <div className={styles.progressBlock}>
            <ProgressBar fraction={uploadFraction !== null && uploadFraction < 1 ? uploadFraction : undefined} />
            <p className={styles.statusText}>
              {slow
                ? 'Still working — if this is the first request in a while, the server can take up to a minute to wake up.'
                : uploadFraction !== null && uploadFraction < 1
                  ? `Uploading — ${Math.round(uploadFraction * 100)}%`
                  : 'Reading your statement — this stays on your device.'}
            </p>
          </div>
        )}
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
