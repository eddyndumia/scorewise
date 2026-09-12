import { apiGet, BASE_URL } from './client';

export interface Profile {
  name: string | null;
}

export async function getProfile(): Promise<Profile> {
  return apiGet<Profile>('/v1/profile');
}

export async function updateProfile(name: string): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/v1/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to update profile: ${res.status}`);
  return res.json();
}
