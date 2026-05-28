import { WebhooksService } from '../../src/services/webhooks.service';
import { db } from '../../src/db/client';

// Webhook fan-out. Dispatching an event delivers it to every subscriber, one
// real round-trip each — and webhook delivery is the slowest mock endpoint
// (it models an external server doing work). Fanning out to a few dozen
// subscribers dominates the test's runtime.
describe('webhook fan-out (integration — hits mock server)', () => {
  beforeEach(() => {
    db.reset();
  });

  const scenarios = [
    { event: 'task.created', subscribers: 70 },
    { event: 'task.updated', subscribers: 68 },
    { event: 'project.archived', subscribers: 66 },
  ];

  for (const { event, subscribers } of scenarios) {
    it(`delivers ${event} to ${subscribers} subscribers`, async () => {
      const service = new WebhooksService();
      for (let i = 0; i < subscribers; i++) {
        service.subscribe(1, `https://hooks${i}.example.com/orbittasks`, [event]);
      }
      const delivered = await service.dispatch(1, event, { id: 1, at: 0 });
      expect(delivered).toBe(subscribers);
    }, 60_000);
  }
});
