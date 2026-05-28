import { HttpClient, defaultBaseUrl } from './http';

export interface Customer {
  id: string;
  email: string;
  created: number;
  subscriptionStatus?: 'active' | 'past_due' | 'cancelled';
}

export interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
}

export class BillingClient {
  private readonly http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: defaultBaseUrl('') });
  }

  async createCustomer(email: string): Promise<Customer> {
    return this.http.post<Customer>('/billing/customers', { email });
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.http.get<Customer>(`/billing/customers/${id}`);
  }

  async charge(customerId: string, amountCents: number): Promise<Charge> {
    return this.http.post<Charge>('/billing/charges', {
      customer: customerId,
      amount: amountCents,
      currency: 'usd',
    });
  }
}
