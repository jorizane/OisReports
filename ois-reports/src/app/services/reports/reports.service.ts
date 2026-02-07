import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type FilterReportValueCreate = {
  filter_test_field_id: number;
  value_text?: string | null;
  value_number?: number | null;
  value_option?: string | null;
  value_bool?: boolean | null;
};

export type ReportCreate = {
  filter_values: FilterReportValueCreate[];
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

export type FilterReportValueRead = {
  filter_test_field_id: number;
  label: string;
  field_type: 'radio' | 'text' | 'number' | 'boolean';
  unit: string | null;
  options: string | null;
  required: boolean;
  min_value: number | null;
  max_value: number | null;
  value_text: string | null;
  value_number: number | null;
  value_option: string | null;
  value_bool: boolean | null;
};

export type ReportDetailRead = ReportRead & {
  filter_values: FilterReportValueRead[];
};

export type ReportUpdate = {
  completed: boolean;
  filter_values: FilterReportValueCreate[];
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
