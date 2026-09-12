import type { SignalStatus } from '../theme/tokens';

export interface PeriodMetrics {
  repayments: {
    onTime: number;
    late: number;
    missed: number;
  };
  fuliza: {
    /** number of days in the period the user carried a Fuliza balance */
    daysActive: number;
    periodDays: number;
  };
  savings: {
    /** total saved/deposited in the period, in KES */
    totalSaved: number;
    /** total income/inflow in the period, in KES — used to judge saving relative to means */
    totalIncome: number;
  };
}

export interface Signal {
  label: string;
  /** 0-100, drives the ring fill */
  value: number;
  status: SignalStatus;
  explanation: string;
  recommendation: string;
}

// Rule-based, not AI — see app/scoring.py on the backend (source of truth;
// this file is kept in sync but is dead code once api/score.ts is in use).
const REPAYMENT_RECOMMENDATIONS: Record<SignalStatus, string> = {
  strong: 'Keep it up — consistent, on-time payments are the single biggest factor in your score.',
  moderate:
    'A few late or missed payments are holding this back. Setting reminders (or autopay, if your lender supports it) for upcoming due dates could help.',
  risk: 'Frequent missed payments are seriously hurting your score. Catching up on any overdue loan or SACCO payments is the highest-impact thing you can do here.',
};
const FULIZA_RECOMMENDATIONS: Record<SignalStatus, string> = {
  strong: "You rarely rely on overdraft — that's a strong signal of day-to-day financial stability.",
  moderate: "Occasional Fuliza use isn't unusual, but cutting back further would strengthen this signal.",
  risk: 'Heavy Fuliza reliance usually points to cash-flow strain. Reducing top-ups over the next few months is likely the fastest way to raise your score.',
};
const SAVINGS_RECOMMENDATIONS: Record<SignalStatus, string> = {
  strong: 'Your consistent savings relative to income is a strong positive signal — keep the pattern going.',
  moderate: 'Increasing regular deposits, even small ones, would strengthen this signal over time.',
  risk: 'Very little is currently being set aside. Even small, regular savings deposits — weekly rather than one lump sum — tend to move this signal fastest.',
};

export interface ScoreResult {
  score: number;
  previousScore: number;
  delta: number;
  signals: Signal[];
  tip: string;
}

const MIN_SCORE = 300;
const MAX_SCORE = 850;

function statusFor(value: number, goodAbove: number, riskBelow: number): SignalStatus {
  if (value >= goodAbove) return 'strong';
  if (value <= riskBelow) return 'risk';
  return 'moderate';
}

function scoreRepaymentHistory(m: PeriodMetrics['repayments']): Signal {
  const total = m.onTime + m.late + m.missed;
  const value = total === 0 ? 100 : Math.round((m.onTime / total) * 100);
  const status = statusFor(value, 80, 50);
  const explanation =
    status === 'strong'
      ? 'Consistent, on-time payments over the last 6 months.'
      : status === 'moderate'
        ? `A few late or missed payments (${m.late + m.missed} of ${total}) in the last 6 months.`
        : `Frequent late or missed payments (${m.late + m.missed} of ${total}) in the last 6 months.`;
  return { label: 'Repayment history', value, status, explanation, recommendation: REPAYMENT_RECOMMENDATIONS[status] };
}

function scoreFulizaReliance(m: PeriodMetrics['fuliza']): Signal {
  const reliance = m.periodDays === 0 ? 0 : Math.round((m.daysActive / m.periodDays) * 100);
  // Higher reliance is worse, so the status thresholds are inverted vs. the other signals.
  const status: SignalStatus = reliance <= 30 ? 'strong' : reliance <= 60 ? 'moderate' : 'risk';
  const explanation =
    status === 'strong'
      ? 'Rarely relies on overdraft facilities.'
      : status === 'moderate'
        ? 'Occasional top-ups suggest some reliance on short-term credit.'
        : 'Frequent, near-continuous reliance on overdraft.';
  return { label: 'Fuliza reliance', value: reliance, status, explanation, recommendation: FULIZA_RECOMMENDATIONS[status] };
}

function scoreSavingsActivity(m: PeriodMetrics['savings']): Signal {
  const rate = m.totalIncome === 0 ? 0 : m.totalSaved / m.totalIncome;
  const value = Math.max(0, Math.min(100, Math.round(rate * 100 * 4))); // ~25% savings rate maps to 100
  const status = statusFor(value, 65, 30);
  const explanation =
    status === 'strong'
      ? 'Regular deposits relative to income.'
      : status === 'moderate'
        ? 'Below-average savings relative to income.'
        : 'Very little set aside relative to income.';
  return { label: 'Savings activity', value, status, explanation, recommendation: SAVINGS_RECOMMENDATIONS[status] };
}

function overallScore(signals: Signal[]): number {
  const repayment = signals.find((s) => s.label === 'Repayment history')!.value;
  const fuliza = signals.find((s) => s.label === 'Fuliza reliance')!.value;
  const savings = signals.find((s) => s.label === 'Savings activity')!.value;

  // Fuliza reliance is inverted (100 = fully reliant, so we score on independence instead).
  const weighted = repayment * 0.5 + (100 - fuliza) * 0.2 + savings * 0.3;
  return Math.round(MIN_SCORE + (weighted / 100) * (MAX_SCORE - MIN_SCORE));
}

function tipFor(signals: Signal[]): string {
  const worst = [...signals].sort((a, b) => {
    const rank = { risk: 0, moderate: 1, strong: 2 };
    return rank[a.status] - rank[b.status];
  })[0];

  switch (worst.label) {
    case 'Fuliza reliance':
      return 'Fewer Fuliza top-ups in the next 3 months could raise your score by ~20 points.';
    case 'Savings activity':
      return 'Setting aside even small, regular deposits could raise your score by ~15 points.';
    default:
      return 'Keeping up consistent, on-time payments over the next 3 months could raise your score by ~20 points.';
  }
}

export function computeScore(current: PeriodMetrics, previous: PeriodMetrics): ScoreResult {
  const signals = [
    scoreRepaymentHistory(current.repayments),
    scoreFulizaReliance(current.fuliza),
    scoreSavingsActivity(current.savings),
  ];
  const previousSignals = [
    scoreRepaymentHistory(previous.repayments),
    scoreFulizaReliance(previous.fuliza),
    scoreSavingsActivity(previous.savings),
  ];

  const score = overallScore(signals);
  const previousScore = overallScore(previousSignals);

  return {
    score,
    previousScore,
    delta: score - previousScore,
    signals,
    tip: tipFor(signals),
  };
}
