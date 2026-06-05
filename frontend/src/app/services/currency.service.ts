import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Currency Service handles multi-currency formatting and live exchange-rate lookup.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.80,
    INR: 83
  };

  constructor(private api: ApiService) { }

  getExchangeRates(base: string = 'USD'): Observable<Record<string, number>> {
    return this.api.get<Record<string, number>>(`/currency/rates?base=${base}`);
  }

  setRates(newRates: Record<string, number>) {
    this.rates = { ...this.rates, ...newRates };
  }

  getRate(currency: string): number {
    return this.rates[currency] ?? 1;
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    try {
      const locale = currency === 'INR' ? 'en-IN' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    const fromRate = this.getRate(fromCurrency);
    const toRate = this.getRate(toCurrency);
    if (!fromRate || !toRate) {
      return amount;
    }
    return amount / fromRate * toRate;
  }

  formatConverted(amount: number, fromCurrency: string, toCurrency: string): string {
    const converted = this.convertAmount(amount, fromCurrency, toCurrency);
    return this.formatCurrency(converted, toCurrency);
  }

  formatINR(amount: number, decimals: number = 2): string {
    if (!isFinite(amount)) {
      return '₹0.00';
    }

    const rounded = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
    const parts = rounded.toFixed(decimals).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '00';
    const formatted = this.applyIndianNumberFormat(integerPart);
    return `₹${formatted}.${decimalPart}`;
  }

  private applyIndianNumberFormat(numberString: string): string {
    const isNegative = numberString.startsWith('-');
    const number = isNegative ? numberString.slice(1) : numberString;
    if (number.length <= 3) {
      return isNegative ? `-${number}` : number;
    }

    const lastThree = number.slice(-3);
    const remaining = number.slice(0, -3);
    const parts: string[] = [];
    let temp = remaining;
    while (temp.length > 0) {
      if (temp.length > 2) {
        parts.unshift(temp.slice(-2));
        temp = temp.slice(0, -2);
      } else {
        parts.unshift(temp);
        temp = '';
      }
    }
    const formatted = [...parts, lastThree].join(',');
    return isNegative ? `-${formatted}` : formatted;
  }
}
