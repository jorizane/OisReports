import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type Customer = {
  id: number;
  name: string;
};

export type FilterPlant = {
  id: number;
  customer_id: number;
  description: string;
  year_built: number;
};

export type FilterPlantCreate = {
  description: string;
  year_built: number;
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

  listFilterPlants(customerId: number) {
    return this.http.get<FilterPlant[]>(`${this.baseUrl}/customers/${customerId}/filter-plants`);
  }

  createFilterPlant(customerId: number, payload: FilterPlantCreate) {
    return this.http.post<FilterPlant>(
      `${this.baseUrl}/customers/${customerId}/filter-plants`,
      payload
    );
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
