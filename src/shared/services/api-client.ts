import { API_BASE_URL } from '@/lib/api';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  timestamp?: string;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const response = await fetch(resolveUrl(path), {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody?.message ?? errorBody?.error ?? message;
    } catch {
      // Keep the HTTP status fallback.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json();
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function getOr<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiClient.get<T>(path);
  } catch {
    return fallback;
  }
}
