export function FingerprintIcon({ color = 'var(--violet)', size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
      <path d="M12 2a9 9 0 0 0-9 9c0 1.5.3 2.6.8 3.8M12 2a9 9 0 0 1 9 9c0 2.5-.5 4.5-1 6M8.5 20a12 12 0 0 1-1.8-4.5M12 5.5A5.5 5.5 0 0 0 6.5 11c0 2.5.5 4 1 5M12 5.5A5.5 5.5 0 0 1 17.5 11c0 3-1 5.5-2.5 8M12 9a2 2 0 0 0-2 2c0 3-1 5.5-2.5 7.5M12 9a2 2 0 0 1 2 2c0 1.3-.2 2.5-.5 3.5" />
    </svg>
  );
}
