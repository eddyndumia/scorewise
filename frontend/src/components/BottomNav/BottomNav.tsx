import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';
import { HomeIcon, SparkleIcon, UserIcon } from './icons';

const tabs = [
  { path: '/home', Icon: HomeIcon },
  { path: '/assistant', Icon: SparkleIcon },
  { path: '/profile', Icon: UserIcon },
] as const;

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      {tabs.map(({ path, Icon }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            className={styles.item}
            onClick={() => navigate(path)}
            aria-label={path.slice(1)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon color={active ? 'var(--violet)' : 'var(--text-muted)'} />
          </button>
        );
      })}
    </nav>
  );
}
