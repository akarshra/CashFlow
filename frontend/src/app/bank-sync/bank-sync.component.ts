import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';
import { BankService } from '../services/bank.service';

declare global {
  interface Window {
    Plaid?: any;
  }
}

@Component({
  selector: 'bank-sync',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatSnackBarModule],
  templateUrl: './bank-sync.component.html',
  styleUrl: './bank-sync.component.css'
})
export class BankSyncComponent implements OnInit {
  transactions: any[] = [];
  loading = false;
  accountConnected = false;
  displayedColumns = ['transactionDate', 'description', 'category', 'amount'];

  syncLogs: string[] = [
    'System standby. Plaid API credentials primed.',
  ];

  mockTransactions = [
    { transactionDate: '2026-05-29', description: 'Stripe Payout - Ref 98402', category: 'Revenue', amount: 8400.00 },
    { transactionDate: '2026-05-27', description: 'Uber Rideshare corporate', category: 'Transport', amount: -35.20 },
    { transactionDate: '2026-05-24', description: 'AWS Cloud Web Hosting', category: 'Software', amount: -89.00 }
  ];

  constructor(private bankService: BankService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  async connectBank(): Promise<void> {
    this.loading = true;
    this.pushLog('Initializing secure OAuth connection protocol...');
    
    try {
      const tokenResponse = await lastValueFrom(this.bankService.createLinkToken());
      this.pushLog('Plaid Link Token verified successfully.');
      await this.loadPlaidScript();
      this.pushLog('Plaid Client Environment script mounted.');
      this.openPlaidLink(tokenResponse.link_token);
    } catch (error) {
      console.error('Plaid connection failed', error);
      this.pushLog('External API handshake aborted. Launching simulated sandbox sync...', 'warning');
      this.simulateSuccessfulSync();
    }
  }

  private simulateSuccessfulSync(): void {
    setTimeout(() => {
      this.pushLog('Simulated authentication completed.');
      setTimeout(() => {
        this.pushLog('Ingesting transaction ledger tables...');
        setTimeout(() => {
          this.accountConnected = true;
          this.transactions = [...this.mockTransactions];
          this.pushLog('Ledger fully active! Sync sequence completed successfully.', 'success');
          this.snackBar.open('Simulated Bank account linked successfully!', 'Close', { duration: 4000 });
          this.loading = false;
        }, 1200);
      }, 1000);
    }, 800);
  }

  private async loadPlaidScript(): Promise<void> {
    if (window.Plaid) {
      return;
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-plaid-link]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Plaid script')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.setAttribute('data-plaid-link', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Plaid script'));
      document.body.appendChild(script);
    });
  }

  private openPlaidLink(linkToken: string): void {
    if (!window.Plaid) {
      this.snackBar.open('Plaid JS could not be loaded.', 'Close', { duration: 4000 });
      this.loading = false;
      return;
    }

    const handler = window.Plaid.create({
      token: linkToken,
      env: 'sandbox',
      onSuccess: async (publicToken: string) => {
        try {
          this.pushLog('Exchanging secure public authentication keys...');
          await lastValueFrom(this.bankService.exchangePublicToken(publicToken));
          this.pushLog('Authentication token accepted. Retrieving statements...');
          this.accountConnected = true;
          await this.loadTransactions();
          this.pushLog('Ledger active! Bank statement synchronized successfully.', 'success');
          this.snackBar.open('Bank account linked successfully!', 'Close', { duration: 3000 });
        } catch (err) {
          console.error('Error exchanging public token', err);
          this.pushLog('Authentication key exchange failed.', 'error');
          this.snackBar.open('Could not complete bank connection. Please try again.', 'Close', { duration: 4000 });
        } finally {
          this.loading = false;
        }
      },
      onExit: (err: any) => {
        if (err) {
          console.warn('Plaid exited with error', err);
          this.pushLog('OAuth transaction aborted.', 'warning');
          this.snackBar.open('Plaid connection was interrupted.', 'Close', { duration: 3000 });
        } else {
          this.pushLog('OAuth window closed.');
        }
        this.loading = false;
      }
    });

    handler.open();
  }

  async loadTransactions(): Promise<void> {
    try {
      const data = await lastValueFrom(this.bankService.listTransactions());
      if (data && data.length > 0) {
        this.transactions = data;
        this.accountConnected = true;
        this.pushLog('Active connection synchronized recent items.');
      } else {
        this.transactions = [];
      }
    } catch (error) {
      console.warn('Unable to load bank transactions', error);
      this.transactions = [];
    }
  }

  pushLog(msg: string, status: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = status === 'success' ? '✓' : status === 'warning' ? '⚠' : status === 'error' ? '✗' : 'ℹ';
    this.syncLogs.unshift(`[${timestamp}] ${prefix} ${msg}`);
  }
}
