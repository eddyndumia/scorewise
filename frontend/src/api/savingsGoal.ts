import { apiGet } from './client';
import { BASE_URL } from './client';

export interface SavingsGoal {
  targetAmount: number;
  createdAt: number;
}

export interface SavingsGoalStatus {
  goal: SavingsGoal | null;
  savedSoFar: number;
}

export async function getSavingsGoal(): Promise<SavingsGoalStatus> {
  return apiGet<SavingsGoalStatus>('/v1/savings-goal');
}

export async function setSavingsGoal(targetAmount: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/savings-goal`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetAmount }),
  });
  if (!res.ok) throw new Error(`PUT /v1/savings-goal failed: ${res.status}`);
}

export async function clearSavingsGoal(): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/savings-goal`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE /v1/savings-goal failed: ${res.status}`);
}
