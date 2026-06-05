export interface Budget {
  id?: number;
  userId?: number;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  collaborators?: string[];
}
