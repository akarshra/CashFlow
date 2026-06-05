export interface Invoice {
  id?: number;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  status?: string;
  description: string;
}
