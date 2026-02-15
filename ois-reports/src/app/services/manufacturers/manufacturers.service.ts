import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type Manufacturer = {
  id: number;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class ManufacturersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listManufacturers() {
    return this.http.get<Manufacturer[]>(`${this.baseUrl}/manufacturers`);
  }

  getManufacturer(manufacturerId: number) {
    return this.http.get<Manufacturer>(`${this.baseUrl}/manufacturers/${manufacturerId}`);
  }

  createManufacturer(name: string) {
    return this.http.post<Manufacturer>(`${this.baseUrl}/manufacturers`, { name });
  }
}
