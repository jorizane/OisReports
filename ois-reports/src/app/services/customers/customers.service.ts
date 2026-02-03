import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type Customer = {
  id: number;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  listCustomers() {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
  }

  getCustomer(id: number) {
    return this.http.get<Customer>(`${this.baseUrl}/customers/${id}`);
  }

  createCustomer(name: string) {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, { name });
  }

  deleteCustomer(id: number) {
    return this.http.delete(`${this.baseUrl}/customers/${id}`);
  }

  updateCustomer(id: number, name: string) {
    return this.http.patch<Customer>(`${this.baseUrl}/customers/${id}`, { name });
  }
}
