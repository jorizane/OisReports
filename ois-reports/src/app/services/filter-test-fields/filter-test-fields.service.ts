import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type FilterTestField = {
  id: number;
  filter_id: number;
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
  private readonly baseUrl = environment.apiBaseUrl;

  listFilterTestFields(filterPlantId: number) {
    return this.http.get<FilterTestField[]>(
      `${this.baseUrl}/filter-plants/${filterPlantId}/filter-test-fields`
    );
  }
}
