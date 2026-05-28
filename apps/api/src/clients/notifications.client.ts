import { HttpClient, defaultBaseUrl } from './http';

export interface NotificationResult {
  ok: boolean;
  channel: string;
  ts: string;
}

export class NotificationsClient {
  private readonly http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: defaultBaseUrl('') });
  }

  async send(channel: string, text: string): Promise<NotificationResult> {
    return this.http.post<NotificationResult>('/notify', { channel, text });
  }
}
