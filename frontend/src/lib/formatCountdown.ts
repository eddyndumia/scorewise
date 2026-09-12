export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return 'expired';

  const minutes = Math.floor(msRemaining / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days}d`;
  if (hours >= 1) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}
