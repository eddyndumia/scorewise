import { BASE_URL } from './client';
import type { ScoreResult } from '../lib/scoring';

export interface AmbiguousGroup {
  id: string;
  businessName: string;
  paybillNumber: string | null;
  count: number;
  totalAmount: number;
  sampleDetail: string;
}

export type UploadResult =
  | ({ status: 'complete' } & ScoreResult)
  | { status: 'needs_review'; sessionId: string; groups: AmbiguousGroup[] };

export interface ApiError {
  code: string;
  message: string;
  [key: string]: unknown;
}

export class StatementApiError extends Error {
  code: string;
  extra: Record<string, unknown>;

  constructor(detail: ApiError) {
    super(detail.message);
    this.code = detail.code;
    const { code: _code, message: _message, ...rest } = detail;
    this.extra = rest;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (body?.detail?.code) throw new StatementApiError(body.detail);
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export async function uploadStatement(file: File, password: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (password) formData.append('password', password);

  const res = await fetch(`${BASE_URL}/v1/statements/upload`, { method: 'POST', credentials: 'include', body: formData });
  return handleResponse<UploadResult>(res);
}

export async function classifyStatement(
  sessionId: string,
  answers: { groupId: string; isRepayment: boolean }[],
): Promise<{ status: 'complete' } & ScoreResult> {
  const res = await fetch(`${BASE_URL}/v1/statements/${sessionId}/classify`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  return handleResponse(res);
}
