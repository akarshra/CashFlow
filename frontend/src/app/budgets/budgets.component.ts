import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Budget } from '../models/budget.model';
import { BudgetService } from '../services/budget.service';
import { CurrencyService } from '../services/currency.service';

@Component({
  selector: 'budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressBarModule],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.css'
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  selectedCurrency = 'INR';
  availableCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
  rates: Record<string, number> = {};
  newBudget: Partial<Budget> = {
    name: '',
    amount: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
  };

  constructor(
    private budgetService: BudgetService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
    this.loadRates();
  }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe((budgets) => {
      this.budgets = budgets;
    });
  }

  loadRates(): void {
    this.currencyService.getExchangeRates('USD').subscribe((rates) => {
      this.rates = rates;
      this.currencyService.setRates(rates);
    });
  }

  createBudget(): void {
    if (!this.newBudget.name || !this.newBudget.amount || !this.newBudget.startDate || !this.newBudget.endDate) {
      return;
    }
    this.budgetService.createBudget(this.newBudget).subscribe((budget) => {
      this.budgets.unshift(budget);
      this.newBudget = {
        name: '',
        amount: 0,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
      };
    });
  }

  formatAmount(amount: number): string {
    if (!amount && amount !== 0) {
      return '';
    }
    return this.currencyService.formatConverted(amount, 'USD', this.selectedCurrency);
  }

  progressPercentage(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now <= start) {
      return 0;
    }
    if (now >= end) {
      return 100;
    }
    return Math.round(((now - start) / (end - start)) * 100);
  }

  dueLabel(endDate: string): string {
    const end = new Date(endDate).getTime();
    const days = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days remaining` : 'Due soon';
  }
}
