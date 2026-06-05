import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private api: ApiService) {}

  list(): Observable<Subscription[]> {
    return this.api.get<Subscription[]>('/subscriptions');
  }

  create(subscription: Subscription): Observable<Subscription> {
    return this.api.post<Subscription>('/subscriptions', subscription);
  }
}
