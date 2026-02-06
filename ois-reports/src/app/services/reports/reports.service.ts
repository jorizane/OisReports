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
  completed: boolean;
};

export type ReportComponentRead = {
  component_id: number;
  component_name: string;
  description: string;
};

export type ReportDetailRead = ReportRead & {
  components: ReportComponentRead[];
};

export type ReportUpdate = {
  completed: boolean;
  component_descriptions: ReportComponentCreate[];
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

  listCustomerReports(customerId: number) {
    return this.http.get<ReportRead[]>(`${this.baseUrl}/customers/${customerId}/reports`);
  }

  getReport(reportId: number) {
    return this.http.get<ReportDetailRead>(`${this.baseUrl}/reports/${reportId}`);
  }

  updateReport(reportId: number, payload: ReportUpdate) {
    return this.http.patch<ReportDetailRead>(`${this.baseUrl}/reports/${reportId}`, payload);
  }
}
