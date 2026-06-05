import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Holding } from '../models/holding.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  constructor(private api: ApiService) {}

  listHoldings(): Observable<Holding[]> {
    return this.api.get<Holding[]>('/portfolio/holdings');
  }

  addHolding(holding: Holding): Observable<Holding> {
    return this.api.post<Holding>('/portfolio/holdings', holding);
  }

  fetchPrices(holdings: Holding[]): Observable<Record<string, number>> {
    const crypto = holdings.filter((h) => h.assetType === 'CRYPTO').map((h) => h.symbol);
    const stocks = holdings.filter((h) => h.assetType === 'STOCK').map((h) => h.symbol);
    return this.api.post<Record<string, number>>('/portfolio/prices', { crypto, stocks });
  }
}
