import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Invoice } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  constructor(private api: ApiService) {}

  getInvoices(): Observable<Invoice[]> {
    return this.api.get<Invoice[]>('/invoices');
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.api.post<Invoice>('/invoices', invoice);
  }
}
