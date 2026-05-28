import { HttpClient, defaultBaseUrl } from './http';

export interface AuditEvent {
  type: string;
  actorId: number;
  resource: string;
  resourceId: string | number;
  at: number;
  meta?: Record<string, unknown>;
}

export class AuditClient {
  private readonly http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: defaultBaseUrl('') });
  }

  async log(events: AuditEvent[]): Promise<{ accepted: boolean; count: number }> {
    return this.http.post('/audit/log', { events });
  }
}
