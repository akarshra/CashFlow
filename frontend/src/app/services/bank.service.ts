import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BankService {
  constructor(private api: ApiService) {}

  createLinkToken(): Observable<{ link_token: string }> {
    return this.api.post<{ link_token: string }>('/bank/link-token', {});
  }

  exchangePublicToken(publicToken: string): Observable<any> {
    return this.api.post('/bank/exchange', { public_token: publicToken });
  }

  listTransactions(): Observable<any[]> {
    return this.api.get<any[]>('/bank/transactions');
  }
}
