import { apiGet, apiPost, BASE_URL } from './client';
import type { ScoreResult } from '../lib/scoring';

export async function getScore(): Promise<ScoreResult> {
  return apiGet<ScoreResult>('/v1/score');
}

export interface SimulateLimits {
  fulizaDaysActive: number;
  latePlusMissed: number;
  totalIncome: number;
}

export interface SimulateAdjustments {
  extraSavings: number;
  fulizaReductionDays: number;
  extraOnTimePayments: number;
}

export async function getSimulateLimits(): Promise<SimulateLimits> {
  return apiGet<SimulateLimits>('/v1/score/simulate/limits');
}

export async function simulateScore(adjustments: SimulateAdjustments): Promise<ScoreResult> {
  return apiPost<ScoreResult>('/v1/score/simulate', adjustments);
}

export async function downloadScoreReport(): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/score/report`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET /v1/score/report failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'scorewise-score-report.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
