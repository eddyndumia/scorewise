import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav/BottomNav';
import { LoadingState } from '../../components/LoadingState/LoadingState';
import { getProfile, updateProfile } from '../../api/profile';
import { getTheme, setTheme, type Theme } from '../../lib/theme';
import styles from './Profile.module.css';

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (!parts[0]) return '?';
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Profile() {
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then((p) => {
      setName(p.name ?? '');
      setLoaded(true);
    });
    setThemeState(getTheme());
  }, []);

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed) updateProfile(trimmed);
  };

  const handleThemeChange = (next: Theme) => {
    setTheme(next);
    setThemeState(next);
  };

  if (!loaded) return <LoadingState message="Loading your profile…" />;

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Profile</h1>

      <div className={styles.profileCard}>
        <div className={styles.avatar}>{initials(name || '?')}</div>
        <div className={styles.nameBlock}>
          <input
            className={styles.nameInput}
            value={name}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
          />
          <p className={styles.nameHint}>Tap to edit</p>
        </div>
      </div>

      <p className={styles.sectionLabel}>Preferences</p>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>App theme</span>
          <div className={styles.themeToggle}>
            <button
              className={[styles.themeOption, theme === 'light' ? styles.themeOptionActive : ''].join(' ')}
              onClick={() => handleThemeChange('light')}
            >
              Light
            </button>
            <button
              className={[styles.themeOption, theme === 'dark' ? styles.themeOptionActive : ''].join(' ')}
              onClick={() => handleThemeChange('dark')}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      <p className={styles.sectionLabel}>More</p>
      <div className={styles.group}>
        <button className={styles.row} onClick={() => navigate('/profile/privacy-security')}>
          <span className={styles.rowLabel}>Privacy & Security</span>
          <span className={styles.chevron}>
            <Chevron />
          </span>
        </button>
        <button className={styles.row} onClick={() => navigate('/profile/about')}>
          <span className={styles.rowLabel}>About PesaScore</span>
          <span className={styles.chevron}>
            <Chevron />
          </span>
        </button>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <BottomNav />
      </div>
    </div>
  );
}
