import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type Manufacturer = {
  id: number;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class ManufacturersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

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
