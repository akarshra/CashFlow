import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Budget } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  constructor(private api: ApiService) {}

  getBudgets(): Observable<Budget[]> {
    return this.api.get<Budget[]>('/budgets');
  }

  createBudget(budget: Partial<Budget>): Observable<Budget> {
    return this.api.post<Budget>('/budgets', budget);
  }

  shareBudget(budgetId: number, collaboratorEmail: string) {
    return this.api.put<Budget>(`/budgets/${budgetId}/share`, { collaboratorEmail });
  }
}
