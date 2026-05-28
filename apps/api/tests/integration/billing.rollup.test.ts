import { BillingService } from '../../src/services/billing.service';
import { db } from '../../src/db/client';

// Month-end billing rollups. Each rollup enrolls a cohort of customers and
// then charges every one of them — two real round-trips per customer to the
// billing provider (the mock server). A few dozen customers is enough to make
// each test take tens of seconds; nothing here sleeps.
//
// This is one of the biggest contributors to the slow `test:api` stage that
// students measure in Workshop 1 and dissect in Workshop 2. The fix in
// Workshop 5 is to mock BillingClient so unit tests don't hit the network at
// all; Workshop 3 also shards the suite so cohorts run in parallel.
describe('billing month-end rollup (integration — hits mock server)', () => {
  beforeEach(() => {
    db.reset();
  });

  const cohorts = [
    { month: 'January', size: 48 },
    { month: 'February', size: 48 },
    { month: 'March', size: 48 },
    { month: 'April', size: 48 },
  ];

  for (const { month, size } of cohorts) {
    it(`rolls up ${month} billing across ${size} customers`, async () => {
      const billing = new BillingService();

      for (let i = 0; i < size; i++) {
        await billing.enrollUser(i + 1, `user${i}@example.com`);
      }

      let succeeded = 0;
      for (let i = 0; i < size; i++) {
        const charge = await billing.charge(i + 1, 1999);
        if (charge.status === 'succeeded') succeeded++;
      }
      expect(succeeded).toBe(size);
    }, 60_000);
  }
});
