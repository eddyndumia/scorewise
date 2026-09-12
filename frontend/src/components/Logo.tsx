function BrainIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 3.5c-1.8 0-3.2 1.3-3.4 3-1.4.4-2.4 1.7-2.4 3.2 0 .7.2 1.3.6 1.8-.5.5-.8 1.2-.8 2 0 1.4 1 2.6 2.3 2.9.1 1.7 1.5 3.1 3.3 3.1.6 0 1.1-.1 1.6-.4V6.2c0-1.5-.7-2.7-1.2-2.7z" />
      <path d="M14.5 3.5c1.8 0 3.2 1.3 3.4 3 1.4.4 2.4 1.7 2.4 3.2 0 .7-.2 1.3-.6 1.8.5.5.8 1.2.8 2 0 1.4-1 2.6-2.3 2.9-.1 1.7-1.5 3.1-3.3 3.1-.6 0-1.1-.1-1.6-.4V6.2c0-1.5.7-2.7 1.2-2.7z" />
      <path d="M12 6.2v12.6" />
    </svg>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(4, size * 0.27),
        background: 'var(--violet)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <BrainIcon size={size * 0.62} />
    </div>
  );
}
