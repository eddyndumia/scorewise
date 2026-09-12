import { apiGet, apiPost } from './client';

export interface ActiveGrantDTO {
  id: string;
  lenderName: string;
  expiresAt: number; // epoch ms
}

export async function getActiveGrants(): Promise<ActiveGrantDTO[]> {
  return apiGet<ActiveGrantDTO[]>('/v1/requests');
}

export async function revokeAccess(id: string): Promise<void> {
  await apiPost(`/v1/requests/${id}/revoke`);
}
