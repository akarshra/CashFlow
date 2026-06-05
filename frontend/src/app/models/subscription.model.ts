export interface Subscription {
  id?: number;
  name: string;
  amount: number;
  cycle: string; // e.g. 'monthly' or 'yearly'
  nextBillingDate: string; // ISO date string YYYY-MM-DD
}
