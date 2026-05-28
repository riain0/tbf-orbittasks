import { HttpClient, defaultBaseUrl } from './http';

export interface DeliveryResult {
  delivered: boolean;
  url: string;
  attempts: number;
}

export class WebhooksClient {
  private readonly http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: defaultBaseUrl('') });
  }

  async deliver(url: string, event: string, payload: unknown): Promise<DeliveryResult> {
    return this.http.post<DeliveryResult>('/webhooks/deliver', { url, event, payload });
  }
}
