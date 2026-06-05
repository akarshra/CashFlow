import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SavingsGoal } from '../models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  constructor(private api: ApiService) {}

  getGoals(): Observable<SavingsGoal[]> {
    return this.api.get<SavingsGoal[]>('/goals');
  }

  createGoal(goal: SavingsGoal): Observable<SavingsGoal> {
    return this.api.post<SavingsGoal>('/goals', goal);
  }

  updateGoal(id: number, goal: SavingsGoal): Observable<SavingsGoal> {
    return this.api.put<SavingsGoal>(`/goals/${id}`, goal);
  }
}
