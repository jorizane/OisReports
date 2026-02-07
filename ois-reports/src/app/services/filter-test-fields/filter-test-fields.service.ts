import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type FilterTestField = {
  id: number;
  label: string;
  field_type: 'radio' | 'text' | 'number' | 'boolean';
  unit: string | null;
  options: string | null;
  required: boolean;
  min_value: number | null;
  max_value: number | null;
};

@Injectable({ providedIn: 'root' })
export class FilterTestFieldsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  listFilterTestFields() {
    return this.http.get<FilterTestField[]>(`${this.baseUrl}/filter-test-fields`);
  }
}
