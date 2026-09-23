import { apiGet, apiPost } from './client';
import type { ActiveGrantDTO } from './requests';

export interface PendingConsentRequest {
  id: string;
  lenderName: string;
  grantDurationDays: number;
  willShare: string[];
  wontShare: string[];
}

export async function getPendingConsentRequests(): Promise<PendingConsentRequest[]> {
  return apiGet<PendingConsentRequest[]>('/v1/consent');
}

export async function getPendingConsentRequest(id: string): Promise<PendingConsentRequest> {
  return apiGet<PendingConsentRequest>(`/v1/consent/${id}`);
}

export async function respondToConsent(id: string, approve: boolean): Promise<{ ok: boolean; grant: ActiveGrantDTO | null }> {
  return apiPost(`/v1/consent/${id}/respond`, { approve });
}
