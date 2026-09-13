import { BASE_URL, NetworkError } from './client';
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

function parseJsonBody(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Uses XMLHttpRequest rather than fetch specifically so `onUploadProgress`
 * can report real bytes-sent-so-far — fetch has no upload progress event.
 * That progress is only real for the upload phase (the browser genuinely
 * knows how many bytes of the PDF have gone out); once the request body has
 * fully sent, the server is parsing (a real M-Pesa statement can run ~7,000
 * transactions) and there is no further real progress signal, which is why
 * the caller should treat 100% upload as "now indeterminate", not "done."
 */
export function uploadStatement(
  file: File,
  password: string,
  onUploadProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (password) formData.append('password', password);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/v1/statements/upload`);
    xhr.withCredentials = true;

    if (onUploadProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onUploadProgress(e.loaded / e.total);
      };
    }

    xhr.onerror = () => reject(new NetworkError());

    xhr.onload = () => {
      const ok = xhr.status >= 200 && xhr.status < 300;
      const body = parseJsonBody(xhr.responseText) as { detail?: ApiError } | UploadResult | null;
      if (!ok) {
        const detail = (body as { detail?: ApiError } | null)?.detail;
        if (detail?.code) reject(new StatementApiError(detail));
        else reject(new Error(`Request failed: ${xhr.status}`));
        return;
      }
      resolve(body as UploadResult);
    };

    xhr.send(formData);
  });
}

export async function classifyStatement(
  sessionId: string,
  answers: { groupId: string; isRepayment: boolean }[],
): Promise<{ status: 'complete' } & ScoreResult> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/v1/statements/${sessionId}/classify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
  } catch {
    throw new NetworkError();
  }
  return handleResponse(res);
}
