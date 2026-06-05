import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  login(payload: { email: string; password: string }): Observable<any> {
    return this.api.post('/auth/login', payload);
  }

  register(payload: { firstName: string; lastName: string; email: string; password: string }): Observable<any> {
    return this.api.post('/auth/register', payload);
  }

  socialLogin(payload: { email: string; firstName?: string; lastName?: string; provider: string; token?: string }): Observable<any> {
    return this.api.post('/auth/social-login', payload);
  }
}
