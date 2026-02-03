import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type ReportComponentCreate = {
  component_id: number;
  description: string;
};

export type ReportCreate = {
  component_descriptions: ReportComponentCreate[];
};

export type ReportRead = {
  id: number;
  customer_id: number;
  customer_name: string;
  filter_plant_id: number;
  filter_plant_description: string;
  created_at: string;
};

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  createReport(customerId: number, filterPlantId: number, payload: ReportCreate) {
    return this.http.post<ReportRead>(
      `${this.baseUrl}/customers/${customerId}/filter-plants/${filterPlantId}/reports`,
      payload
    );
  }

  listReports() {
    return this.http.get<ReportRead[]>(`${this.baseUrl}/reports`);
  }
}
