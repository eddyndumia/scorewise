// Canonical token values. Mirrored as CSS custom properties in theme/global.css —
// keep the two in sync. Source: mockups/b2b-dashboard-token-reference.html, confirmed
// against the written brief. See CLAUDE.md "Design tokens".

export const colors = {
  page: '#f2f1ec',
  surface: '#ffffff',
  border: '#e6e3da',

  textPrimary: '#17181c',
  textSecondary: '#74736a',
  textMuted: '#a6a498',

  violet: '#4a3fb8',
  violetLight: '#ece9fb',

  green: '#17794f',
  greenLight: '#e2f2e9',
  amber: '#b3760f',
  amberLight: '#faf0dc',
  coral: '#c1502e',
  coralLight: '#fbe9e2',
} as const;

export const radius = {
  card: '16px',
  control: '12px',
  pill: '999px',
} as const;

export type SignalStatus = 'strong' | 'moderate' | 'risk';

export const statusColors: Record<SignalStatus, { bg: string; text: string }> = {
  strong: { bg: colors.greenLight, text: colors.green },
  moderate: { bg: colors.amberLight, text: colors.amber },
  risk: { bg: colors.coralLight, text: colors.coral },
};
