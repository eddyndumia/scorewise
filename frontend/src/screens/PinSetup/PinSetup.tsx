import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinKeypad } from '../../components/PinKeypad/PinKeypad';
import { Button } from '../../components/Button/Button';
import { setPin, setUnlocked, isBiometricAvailable, enrollBiometric } from '../../lib/session';
import { FingerprintIcon } from '../../components/FingerprintIcon';
import styles from './PinSetup.module.css';

type Step = 'create' | 'confirm' | 'biometric';

export function PinSetup() {
  const [step, setStep] = useState<Step>('create');
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  useEffect(() => {
    if (step === 'create' && pin.length === 4) {
      setStep('confirm');
    }
  }, [pin, step]);

  useEffect(() => {
    if (step === 'confirm' && confirmPin.length === 4) {
      if (confirmPin === pin) {
        setPin(pin);
        setUnlocked();
        setError('');
        if (biometricAvailable) {
          setStep('biometric');
        } else {
          navigate('/home');
        }
      } else {
        setError("PINs don't match — try again.");
        setTimeout(() => {
          setStep('create');
          setPinValue('');
          setConfirmPin('');
          setError('');
        }, 900);
      }
    }
  }, [confirmPin, step, pin, biometricAvailable, navigate]);

  const handleEnableBiometric = async () => {
    await enrollBiometric();
    navigate('/home');
  };

  if (step === 'biometric') {
    return (
      <div className={styles.screen}>
        <div className={styles.biometricIcon}>
          <FingerprintIcon size={26} />
        </div>
        <h1 className={styles.title}>Use Face ID or Touch ID?</h1>
        <p className={styles.subtitle}>Unlock PesaScore faster next time, without typing your PIN.</p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={handleEnableBiometric}>
            Enable
          </Button>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            Not now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{step === 'create' ? 'Create a PIN' : 'Confirm your PIN'}</h1>
      <p className={styles.subtitle}>
        {step === 'create' ? "You'll use this to unlock PesaScore." : 'Enter it once more.'}
      </p>
      <p className={styles.errorText}>{error}</p>
      <PinKeypad
        value={step === 'create' ? pin : confirmPin}
        onChange={step === 'create' ? setPinValue : setConfirmPin}
        error={!!error}
      />
    </div>
  );
}
