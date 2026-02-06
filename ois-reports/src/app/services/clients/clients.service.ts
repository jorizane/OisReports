import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type Client = {
  id: number;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  listClients() {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  getClient(clientId: number) {
    return this.http.get<Client>(`${this.baseUrl}/clients/${clientId}`);
  }

  createClient(name: string) {
    return this.http.post<Client>(`${this.baseUrl}/clients`, { name });
  }
}
