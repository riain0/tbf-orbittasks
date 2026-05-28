import { db } from '../src/db/client';
import { BillingService } from '../src/services/billing.service';

describe('reports', () => {
  beforeEach(() => {
    db.reset();
  });

  // THE SLOW TEST. This test makes a long sequence of real HTTP calls to
  // the mock billing service. Each call is a few hundred milliseconds of
  // legitimate network round-trip. Strung together, the test takes 10-20
  // seconds — and there are no `sleep()` calls anywhere.
  //
  // Workshop 2 students will identify this as a slow test.
  // Workshop 5 students will replace BillingClient with a manual mock
  // and watch the duration collapse to near-zero.
  it('rolls up end-of-month billing across many customers', async () => {
    const billing = new BillingService();
    const userCount = 25; // realistic mid-sized cohort

    // Enroll N users in billing. Each round-trips to the mock provider.
    for (let i = 0; i < userCount; i++) {
      await billing.enrollUser(i + 1, `user${i}@example.com`);
    }

    // Now charge each one — another N round-trips.
    for (let i = 0; i < userCount; i++) {
      const charge = await billing.charge(i + 1, 1999);
      expect(charge.status).toBe('succeeded');
    }
  }, 60_000);

  it('counts done tasks', () => {
    db.insert('tasks', { projectId: 1, status: 'done' });
    db.insert('tasks', { projectId: 1, status: 'todo' });
    db.insert('tasks', { projectId: 1, status: 'done' });
    const done = db.list('tasks', (r) => r.status === 'done');
    expect(done).toHaveLength(2);
  });

  // FLAKY TEST.
  // Races a randomized timer (50–250 ms) against a fixed 150ms timer.
  // Passes only when the random side beats the fixed side — roughly 50%
  // of the time. Workshop 2 students will identify this as a
  // timing-dependent race condition.
  it('processes async events within budget', async () => {
    const fast = new Promise<string>((r) => {
      setTimeout(() => r('fast'), 50 + Math.random() * 200);
    });
    const slow = new Promise<string>((r) => {
      setTimeout(() => r('slow'), 150);
    });
    const winner = await Promise.race([fast, slow]);
    expect(winner).toBe('fast');
  });
});
