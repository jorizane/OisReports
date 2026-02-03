import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type FilterPlant = {
  id: number;
  customer_id: number;
  manufacturer_id: number;
  description: string;
  year_built: number;
};

export type FilterPlantCreate = {
  description: string;
  year_built: number;
  manufacturer_id: number;
};

@Injectable({ providedIn: 'root' })
export class FilterPlantsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  listFilterPlants(customerId: number) {
    return this.http.get<FilterPlant[]>(`${this.baseUrl}/customers/${customerId}/filter-plants`);
  }

  listFilterPlantsByManufacturer(manufacturerId: number) {
    return this.http.get<FilterPlant[]>(
      `${this.baseUrl}/manufacturers/${manufacturerId}/filter-plants`
    );
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
}
