import { useEffect, useState } from 'react';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '../../api/notifications';
import styles from './NotificationBell.module.css';

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = () => getNotifications().then(setNotifications);

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = () => setOpen(true);

  const handleRowClick = async (n: Notification) => {
    if (!n.read) {
      await markNotificationRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <button className={styles.bellBtn} onClick={handleOpen} aria-label="Notifications">
        <BellIcon />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className={styles.sheetHeader}>
          <p className={styles.sheetTitle}>Notifications</p>
          {unreadCount > 0 && (
            <button className={styles.markAllLink} onClick={handleMarkAll}>
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className={styles.empty}>No notifications yet.</p>
        ) : (
          <div className={styles.list}>
            {notifications.map((n) => (
              <button key={n.id} className={styles.row} onClick={() => handleRowClick(n)}>
                <span className={[styles.dot, n.read ? styles.dotHidden : ''].join(' ')} />
                <div className={styles.rowText}>
                  <p className={styles.message}>{n.message}</p>
                  <p className={styles.timeAgo}>{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
