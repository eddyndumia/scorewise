import type { PeriodMetrics } from '../lib/scoring';

// Stand-in for parsed Daraja/statement data until the real ingestion pipeline exists.
// Shapes match PeriodMetrics so computeScore() runs against the same structure real
// statement parsing would eventually produce.

export const currentPeriod: PeriodMetrics = {
  repayments: { onTime: 11, late: 1, missed: 0 },
  fuliza: { daysActive: 27, periodDays: 60 },
  savings: { totalSaved: 9200, totalIncome: 46000 },
};

export const previousPeriod: PeriodMetrics = {
  repayments: { onTime: 9, late: 2, missed: 1 },
  fuliza: { daysActive: 34, periodDays: 60 },
  savings: { totalSaved: 6100, totalIncome: 44000 },
};
