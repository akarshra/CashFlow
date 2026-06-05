import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { AnalyticsSummary } from '../models/analytics-summary.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiService) {}

  getSummary(): Observable<AnalyticsSummary> {
    return this.api.get<AnalyticsSummary>('/analytics/summary');
  }
}
