import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  hasBiometric,
  disableBiometric,
  enrollBiometric,
  isBiometricAvailable,
  clearAll,
} from '../../lib/session';
import { setCachedAccount } from '../../lib/authSession';
import { downloadScoreReport } from '../../api/score';
import { downloadDataExport, deleteAccountData } from '../../api/account';
import styles from './PrivacySecurity.module.css';

export function PrivacySecurity() {
  const navigate = useNavigate();
  const [biometricOn, setBiometricOn] = useState(hasBiometric());
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      await downloadScoreReport();
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      await downloadDataExport();
    } finally {
      setExportingData(false);
    }
  };

  const handleToggleBiometric = async () => {
    if (biometricOn) {
      disableBiometric();
      setBiometricOn(false);
      return;
    }
    const ok = await enrollBiometric();
    if (ok) setBiometricOn(true);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      // Soft reset: wipes the backend's data rows AND ends the server
      // session (see routers/account.py) — the Supabase account itself
      // isn't deleted, so the same email/password logs back in and starts
      // fresh. Without the backend call, "Reset account" only reset the
      // frontend while the old profile/score/grants silently survived on
      // the backend, which wasn't a real reset.
      await deleteAccountData();
    } finally {
      clearAll();
      setCachedAccount(false);
      navigate('/login');
    }
  };

  return (
    <div className={styles.screen}>
      <button className={styles.backRow} onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1 className={styles.title}>Privacy & Security</h1>

      <p className={styles.sectionLabel}>Account security</p>
      <div className={styles.group}>
        <button className={styles.row} onClick={() => navigate('/pin-setup')}>
          <span className={styles.rowLabel}>Change PIN</span>
          <span className={styles.rowValue}>→</span>
        </button>
        <button className={styles.row} onClick={handleToggleBiometric} disabled={biometricAvailable === false}>
          <span className={styles.rowLabel}>Face ID / Touch ID</span>
          <span className={biometricOn ? styles.rowValueOn : styles.rowValue}>
            {biometricAvailable === false ? 'Not available on this device' : biometricOn ? 'Enabled' : 'Disabled'}
          </span>
        </button>
      </div>

      <p className={styles.sectionLabel}>Your data</p>
      <div className={styles.group}>
        <button className={styles.row} onClick={() => navigate('/statement-upload')}>
          <span className={styles.rowLabel}>Update my statement</span>
          <span className={styles.rowValue}>→</span>
        </button>
        <button className={styles.row} onClick={() => navigate('/requests')}>
          <span className={styles.rowLabel}>Lenders with access</span>
          <span className={styles.rowValue}>→</span>
        </button>
        <button className={styles.row} onClick={handleDownloadReport} disabled={downloadingReport}>
          <span className={styles.rowLabel}>Download score report (PDF)</span>
          <span className={styles.rowValue}>{downloadingReport ? '…' : '↓'}</span>
        </button>
        <button className={styles.row} onClick={handleExportData} disabled={exportingData}>
          <span className={styles.rowLabel}>Export all my data (JSON)</span>
          <span className={styles.rowValue}>{exportingData ? '…' : '↓'}</span>
        </button>
        <button className={styles.row} onClick={() => navigate('/terms', { state: { viewOnly: true } })}>
          <span className={styles.rowLabel}>Terms & Conditions</span>
          <span className={styles.rowValue}>→</span>
        </button>
      </div>

      <p className={styles.sectionLabel}>Danger zone</p>
      <div className={styles.group}>
        <button className={styles.row} onClick={handleReset} disabled={resetting}>
          <span className={[styles.rowLabel, styles.destructiveLabel].join(' ')}>{resetting ? 'Resetting…' : 'Reset account'}</span>
        </button>
      </div>
    </div>
  );
}
