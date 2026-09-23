export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// Thrown when fetch() itself rejects (DNS failure, connection refused, a
// sleeping Render free-tier instance not yet accepting connections) rather
// than when the server responds with an HTTP error status. The two need
// different messaging: an HTTP error means the server is up and said no; a
// network error means the request never got a response at all, which for
// this backend's free-tier hosting usually means "still waking up."
export class NetworkError extends Error {
  constructor() {
    super('Network request failed');
  }
}

async function guardFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new NetworkError();
  }
}

// An HTTP error from the backend, with its status and, when the backend
// sent one, a stable machine-readable code (e.g. "no_score" when there's no
// statement yet), so screens can branch on the case instead of string-matching.
export class ApiError extends Error {
  status: number;
  code: string | null;
  constructor(status: number, code: string | null, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function toApiError(res: Response, fallback: string): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  const detail = body?.detail;
  if (detail && typeof detail === 'object') {
    return new ApiError(res.status, detail.code ?? null, detail.message ?? fallback);
  }
  return new ApiError(res.status, null, typeof detail === 'string' ? detail : fallback);
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await guardFetch(`${BASE_URL}${path}`, { credentials: 'include' });
  if (!res.ok) throw await toApiError(res, `GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await guardFetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await toApiError(res, `POST ${path} failed: ${res.status}`);
  return res.json();
}
