import { HttpClient, defaultBaseUrl } from './http';

export interface EmailReceipt {
  messageId: string;
  to: string;
  accepted: boolean;
}

export interface SendEmail {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export class EmailClient {
  private readonly http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: defaultBaseUrl('') });
  }

  async send(email: SendEmail): Promise<EmailReceipt> {
    return this.http.post<EmailReceipt>('/email/send', email);
  }

  async sendBatch(emails: SendEmail[]): Promise<EmailReceipt[]> {
    // Naive: send one at a time. Real implementation would batch.
    const out: EmailReceipt[] = [];
    for (const e of emails) {
      out.push(await this.send(e));
    }
    return out;
  }
}
