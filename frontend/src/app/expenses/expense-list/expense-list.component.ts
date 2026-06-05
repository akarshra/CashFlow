import { Component, OnInit } from '@angular/core';
import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { CurrencyService } from '../../services/currency.service';
import { gsap } from 'gsap';
import { environment } from '../../../environments/environment';

export interface ExpenseRow {
  id?: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  displayedColumns = ['date', 'category', 'description', 'amount'];
  expenses: ExpenseRow[] = [];
  filteredExpenses: ExpenseRow[] = [];
  searchQuery = '';
  exportUrl = `${environment.apiBaseUrl}/expenses/export/csv`;

  selectedCurrency = 'INR';
  availableCurrencies = ['USD', 'EUR', 'GBP', 'INR'];

  mockExpenses: ExpenseRow[] = [
    { id: 1, date: '2026-05-28', category: 'Software', description: 'GitHub Enterprise license', amount: 89.00 },
    { id: 2, date: '2026-05-25', category: 'Transport', description: 'Corporate travel taxi', amount: 35.20 },
    { id: 3, date: '2026-05-22', category: 'Food', description: 'Team sync dinner', amount: 120.50 },
    { id: 4, date: '2026-05-18', category: 'Marketing', description: 'Search engine campaigns', amount: 450.00 },
    { id: 5, date: '2026-05-15', category: 'Software', description: 'Figma Pro subscription', amount: 15.00 }
  ];

  constructor(
    private expenseService: ExpenseService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.list().subscribe({
      next: (data) => {
        // Map backend Expense model properties if they differ (e.g. occurredAt -> date)
        if (data && data.length > 0) {
          this.expenses = data.map((exp: any) => ({
            id: exp.id,
            date: exp.occurredAt ? exp.occurredAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
            category: exp.categoryId === 1 ? 'Software' : exp.categoryId === 2 ? 'Food' : exp.categoryId === 3 ? 'Transport' : 'Miscellaneous',
            description: exp.description || 'Corporate expense',
            amount: exp.amount
          }));
        } else {
          this.expenses = [...this.mockExpenses];
        }
        this.applyFilter();
      },
      error: () => {
        this.expenses = [...this.mockExpenses];
        this.applyFilter();
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredExpenses = [...this.expenses];
    } else {
      this.filteredExpenses = this.expenses.filter(e => 
        e.description.toLowerCase().includes(query) || 
        e.category.toLowerCase().includes(query)
      );
    }
  }

  formatAmount(amount: number): string {
    return this.currencyService.formatConverted(amount, 'USD', this.selectedCurrency);
  }

  onCurrencyChange(): void {
    gsap.from('.item-amount', {
      scale: 1.15,
      opacity: 0.5,
      y: -5,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out'
    });
  }

  get totalSpend(): number {
    return this.filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }

  formatTotal(): string {
    return this.currencyService.formatConverted(this.totalSpend, 'USD', this.selectedCurrency);
  }

  // Aggregate values for the SVG donut chart
  getCategoryShare(category: string): number {
    const catTotal = this.filteredExpenses
      .filter(e => e.category.toLowerCase() === category.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
    const overall = this.totalSpend || 1;
    return Math.round((catTotal / overall) * 100);
  }

  // Safe category SVG dash-array calculators
  getDonutStrokeArray(): string {
    const soft = this.getCategoryShare('Software');
    const food = this.getCategoryShare('Food');
    const trans = this.getCategoryShare('Transport');
    const other = 100 - (soft + food + trans);
    
    // Software dash starts at 0, goes 'soft'
    // Food starts after 'soft', goes 'food'
    // Transport starts after 'soft+food', goes 'trans'
    // Misc takes the rest
    return `${soft} ${food} ${trans} ${other >= 0 ? other : 0}`;
  }

  getCategoryIcon(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('soft') || c.includes('tool') || c.includes('license')) return 'code';
    if (c.includes('food') || c.includes('dine') || c.includes('meal')) return 'restaurant';
    if (c.includes('trans') || c.includes('cab') || c.includes('ride')) return 'local_taxi';
    if (c.includes('market') || c.includes('ads')) return 'campaign';
    return 'receipt_long';
  }
}
