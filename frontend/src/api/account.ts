import { BASE_URL } from './client';

export async function downloadDataExport(): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/data-export`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET /v1/data-export failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'scorewise-data-export.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function deleteAccountData(): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/account`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error(`DELETE /v1/account failed: ${res.status}`);
}
