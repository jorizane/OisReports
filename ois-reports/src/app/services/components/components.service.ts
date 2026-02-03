import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type Component = {
  id: number;
  filter_plant_id: number;
  name: string;
};

export type ComponentCreate = {
  name: string;
};

@Injectable({ providedIn: 'root' })
export class ComponentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

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
}
