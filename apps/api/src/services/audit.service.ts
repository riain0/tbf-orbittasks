import { AuditClient, AuditEvent } from '../clients/audit.client';

export class AuditService {
  private buffer: AuditEvent[] = [];

  constructor(
    private readonly client: AuditClient = new AuditClient(),
    private readonly flushThreshold = 20,
  ) {}

  record(event: Omit<AuditEvent, 'at'>): void {
    this.buffer.push({ ...event, at: Date.now() });
    if (this.buffer.length >= this.flushThreshold) {
      // fire and forget
      void this.flush();
    }
  }

  async flush(): Promise<number> {
    if (this.buffer.length === 0) return 0;
    const toSend = this.buffer.splice(0);
    const result = await this.client.log(toSend);
    return result.count;
  }

  size(): number {
    return this.buffer.length;
  }
}
