import { BillingClient, Customer, Charge } from '../clients/billing.client';
import { db } from '../db/client';

export interface BillingRecord {
  id: number;
  userId: number;
  customerId: string;
  status: 'active' | 'past_due' | 'cancelled';
  createdAt: number;
}

export class BillingService {
  constructor(private readonly client: BillingClient = new BillingClient()) {}

  async enrollUser(userId: number, email: string): Promise<BillingRecord> {
    const customer = await this.client.createCustomer(email);
    return db.insert('billing', {
      userId,
      customerId: customer.id,
      status: 'active',
      createdAt: Date.now(),
    }) as unknown as BillingRecord;
  }

  async charge(userId: number, amountCents: number): Promise<Charge> {
    const record = db.find('billing', (r) => r.userId === userId) as
      | BillingRecord
      | undefined;
    if (!record) throw new Error('user not enrolled in billing');
    return this.client.charge(record.customerId, amountCents);
  }

  async refresh(userId: number): Promise<Customer> {
    const record = db.find('billing', (r) => r.userId === userId) as
      | BillingRecord
      | undefined;
    if (!record) throw new Error('user not enrolled in billing');
    return this.client.getCustomer(record.customerId);
  }

  calculateMonthlyTotal(charges: Charge[]): number {
    return charges
      .filter((c) => c.status === 'succeeded')
      .reduce((acc, c) => acc + c.amount, 0);
  }
}
