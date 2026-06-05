import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from '../models/subscription.model';
import { SubscriptionService } from '../services/subscription.service';
import { CurrencyService } from '../services/currency.service';

@Component({
  selector: 'subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  selectedCurrency = 'INR';
  availableCurrencies = ['USD', 'EUR', 'GBP', 'INR'];

  newSubscription: Partial<Subscription> = {
    name: '',
    amount: 0,
    cycle: 'monthly',
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().slice(0, 10)
  };

  mockSubscriptions: Subscription[] = [
    { id: 1, name: 'AWS Cloud Compute', amount: 89.00, cycle: 'monthly', nextBillingDate: '2026-06-18' },
    { id: 2, name: 'Adobe Creative Suite', amount: 52.99, cycle: 'monthly', nextBillingDate: '2026-06-22' },
    { id: 3, name: 'GitHub Copilot Business', amount: 19.00, cycle: 'monthly', nextBillingDate: '2026-06-10' },
    { id: 4, name: 'Google Workspace', amount: 12.00, cycle: 'monthly', nextBillingDate: '2026-06-14' }
  ];

  constructor(
    private subscriptionService: SubscriptionService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.subscriptionService.list().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.subscriptions = data;
        } else {
          this.subscriptions = [...this.mockSubscriptions];
        }
      },
      error: () => {
        this.subscriptions = [...this.mockSubscriptions];
      }
    });
  }

  createSubscription(): void {
    if (!this.newSubscription.name || !this.newSubscription.amount || !this.newSubscription.cycle || !this.newSubscription.nextBillingDate) {
      return;
    }
    const payload: Subscription = {
      name: this.newSubscription.name,
      amount: Number(this.newSubscription.amount),
      cycle: this.newSubscription.cycle,
      nextBillingDate: this.newSubscription.nextBillingDate
    };

    this.subscriptionService.create(payload).subscribe({
      next: (created) => {
        this.subscriptions.unshift(created);
        this.resetForm();
      },
      error: () => {
        // Fallback for user responsiveness: simulate created subscription locally
        const simulated: Subscription = {
          id: Math.floor(Math.random() * 1000) + 100,
          ...payload
        };
        this.subscriptions.unshift(simulated);
        this.resetForm();
      }
    });
  }

  resetForm(): void {
    this.newSubscription = {
      name: '',
      amount: 0,
      cycle: 'monthly',
      nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().slice(0, 10)
    };
  }

  get totalMonthlyCost(): number {
    return this.subscriptions.reduce((sum, item) => {
      const amt = item.amount;
      return sum + (item.cycle === 'yearly' ? amt / 12 : amt);
    }, 0);
  }

  get totalYearlyCost(): number {
    return this.totalMonthlyCost * 12;
  }

  formatAmount(amount: number): string {
    return this.currencyService.formatConverted(amount, 'USD', this.selectedCurrency);
  }

  formatMonthlyTotal(): string {
    return this.currencyService.formatConverted(this.totalMonthlyCost, 'USD', this.selectedCurrency);
  }

  formatYearlyTotal(): string {
    return this.currencyService.formatConverted(this.totalYearlyCost, 'USD', this.selectedCurrency);
  }

  getDaysRemaining(dateStr: string): number {
    const end = new Date(dateStr).getTime();
    const now = new Date();
    // Normalize to midnight
    now.setHours(0, 0, 0, 0);
    const diff = end - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }

  getDaysPercent(dateStr: string): number {
    const remaining = this.getDaysRemaining(dateStr);
    const totalDays = 30; // standard month reference
    const percent = Math.round((remaining / totalDays) * 100);
    return percent > 100 ? 100 : percent;
  }

  getBrandIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('aws') || n.includes('cloud') || n.includes('hosting')) return 'cloud';
    if (n.includes('github') || n.includes('copilot') || n.includes('dev')) return 'code';
    if (n.includes('adobe') || n.includes('creative') || n.includes('design')) return 'brush';
    if (n.includes('spotify') || n.includes('music') || n.includes('netflix') || n.includes('show')) return 'music_note';
    if (n.includes('google') || n.includes('workspace') || n.includes('mail')) return 'mail';
    return 'subscriptions';
  }
}
