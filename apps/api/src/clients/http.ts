/**
 * Minimal HTTP client used by every external-service client.
 *
 * Reads MOCK_SERVER_URL from the environment in tests; otherwise uses
 * the production URL configured per-client. Real CI tests against the
 * mock server; production would point at the actual SaaS provider.
 */

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface HttpClientOptions {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}

export class HttpClient {
  constructor(private readonly opts: HttpClientOptions) {}

  private url(path: string): string {
    return `${this.opts.baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
  }

  async get<T>(path: string, query?: Record<string, string | number>): Promise<T> {
    const qs = query
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return this.request<T>('GET', path + qs);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.opts.timeoutMs ?? 10000);

    try {
      const res = await fetch(this.url(path), {
        method,
        headers: {
          'content-type': 'application/json',
          ...(this.opts.defaultHeaders ?? {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new HttpError(res.status, `${method} ${path} -> ${res.status} ${text}`);
      }

      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return (await res.json()) as T;
      }
      return (await res.text()) as unknown as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

const MOCK_BASE = () => process.env.MOCK_SERVER_URL ?? 'http://localhost:4567';

export function defaultBaseUrl(suffix: string): string {
  // In tests MOCK_SERVER_URL is set; in production each client would be
  // configured with its real provider URL.
  return MOCK_BASE() + suffix;
}
