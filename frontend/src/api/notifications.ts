import { apiGet, apiPost } from './client';

export interface Notification {
  id: string;
  kind: 'score_change' | 'consent_request';
  message: string;
  createdAt: number;
  read: boolean;
}

export async function getNotifications(): Promise<Notification[]> {
  return apiGet<Notification[]>('/v1/notifications');
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiPost(`/v1/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPost('/v1/notifications/read-all');
}
