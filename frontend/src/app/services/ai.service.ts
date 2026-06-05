import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private api: ApiService) {}

  getInsights(payload: { prompt: string }): Observable<any> {
    return this.api.post('/ai/insights', payload);
  }

  categorizeExpense(payload: { description: string; amount: number }): Observable<any> {
    return this.api.post('/ai/categorize', payload);
  }

  getForecast(): Observable<any> {
    return this.api.get('/ai/forecast');
  }

  chat(payload: { prompt: string }): Observable<any> {
    return this.api.post('/ai/chat', payload);
  }

  getRunwayProjection(): Observable<any> {
    return this.api.get('/ai/runway-projection');
  }

  getAuditAlerts(): Observable<any> {
    return this.api.get('/ai/audit-alerts');
  }
}
