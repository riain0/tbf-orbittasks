import { WebhooksClient } from '../clients/webhooks.client';
import { db } from '../db/client';

export interface WebhookSubscription {
  id: number;
  workspaceId: number;
  url: string;
  events: string[];
  createdAt: number;
}

export class WebhooksService {
  constructor(private readonly client: WebhooksClient = new WebhooksClient()) {}

  subscribe(workspaceId: number, url: string, events: string[]): WebhookSubscription {
    return db.insert('webhooks', {
      workspaceId,
      url,
      events,
      createdAt: Date.now(),
    }) as unknown as WebhookSubscription;
  }

  unsubscribe(id: number): boolean {
    const sub = db.find('webhooks', (r) => r.id === id);
    if (!sub) return false;
    // db.remove not implemented; mark deleted
    (sub as { deletedAt?: number }).deletedAt = Date.now();
    return true;
  }

  list(workspaceId: number): WebhookSubscription[] {
    return db.list(
      'webhooks',
      (r) => r.workspaceId === workspaceId && !(r as { deletedAt?: number }).deletedAt,
    ) as unknown as WebhookSubscription[];
  }

  async dispatch(workspaceId: number, event: string, payload: unknown): Promise<number> {
    const subs = this.list(workspaceId).filter((s) => s.events.includes(event));
    let delivered = 0;
    for (const sub of subs) {
      try {
        const result = await this.client.deliver(sub.url, event, payload);
        if (result.delivered) delivered++;
      } catch {
        // swallow; production would retry / dead-letter
      }
    }
    return delivered;
  }
}
