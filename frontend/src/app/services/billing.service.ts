import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface PremiumStatusResponse {
  email: string;
  isPremium: boolean;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  constructor(private api: ApiService) {}

  createCheckoutSession(successUrl: string, cancelUrl: string): Observable<CheckoutResponse> {
    return this.api.post<CheckoutResponse>('/billing/checkout', { successUrl, cancelUrl });
  }

  simulateSuccess(email: string): Observable<any> {
    return this.api.post<any>('/billing/simulate-success', { email });
  }

  getStatus(): Observable<PremiumStatusResponse> {
    return this.api.get<PremiumStatusResponse>('/billing/status');
  }
}
