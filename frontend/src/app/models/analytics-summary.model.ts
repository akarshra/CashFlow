export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  monthlySavings: number;
  categoryBreakdown: { category: string; amount: number }[];
}
