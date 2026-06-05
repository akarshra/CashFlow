import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private api: ApiService) {}

  list(): Observable<Expense[]> {
    return this.api.get<Expense[]>('/expenses');
  }

  create(expense: Expense): Observable<Expense> {
    return this.api.post<Expense>('/expenses', expense);
  }

  update(id: number, expense: Expense): Observable<Expense> {
    return this.api.put<Expense>(`/expenses/${id}`, expense);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/expenses/${id}`);
  }
}
