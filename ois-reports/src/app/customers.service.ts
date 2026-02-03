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

export type Component = {
  id: number;
  filter_plant_id: number;
  name: string;
};

export type ComponentCreate = {
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

  listFilterPlants(customerId: number) {
    return this.http.get<FilterPlant[]>(`${this.baseUrl}/customers/${customerId}/filter-plants`);
  }

  createFilterPlant(customerId: number, payload: FilterPlantCreate) {
    return this.http.post<FilterPlant>(
      `${this.baseUrl}/customers/${customerId}/filter-plants`,
      payload
    );
  }

  getFilterPlant(filterPlantId: number) {
    return this.http.get<FilterPlant>(`${this.baseUrl}/filter-plants/${filterPlantId}`);
  }

  updateFilterPlant(filterPlantId: number, payload: FilterPlantCreate) {
    return this.http.patch<FilterPlant>(`${this.baseUrl}/filter-plants/${filterPlantId}`, payload);
  }

  deleteFilterPlant(filterPlantId: number) {
    return this.http.delete(`${this.baseUrl}/filter-plants/${filterPlantId}`);
  }

  listComponents(filterPlantId: number) {
    return this.http.get<Component[]>(
      `${this.baseUrl}/filter-plants/${filterPlantId}/components`
    );
  }

  createComponent(filterPlantId: number, payload: ComponentCreate) {
    return this.http.post<Component>(
      `${this.baseUrl}/filter-plants/${filterPlantId}/components`,
      payload
    );
  }

  getComponent(componentId: number) {
    return this.http.get<Component>(`${this.baseUrl}/components/${componentId}`);
  }

  updateComponent(componentId: number, payload: ComponentCreate) {
    return this.http.patch<Component>(`${this.baseUrl}/components/${componentId}`, payload);
  }

  deleteComponent(componentId: number) {
    return this.http.delete(`${this.baseUrl}/components/${componentId}`);
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
