import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Income } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  constructor(private api: ApiService) {}

  list(): Observable<Income[]> {
    return this.api.get<Income[]>('/incomes');
  }

  create(income: Income): Observable<Income> {
    return this.api.post<Income>('/incomes', income);
  }
}
