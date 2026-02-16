import { Injectable, signal } from '@angular/core';

import { Client, ClientsService } from '../../services/clients/clients.service';

@Injectable({ providedIn: 'root' })
export class ClientsStore {
  readonly clients = signal<Client[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly clientsService: ClientsService) {}

  loadClients(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clientsService.listClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Auftraggeber konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  addClient(name: string, onSuccess?: () => void): void {
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.errorMessage.set('Bitte einen Auftraggebernamen eingeben.');
      return;
    }

    this.clientsService.createClient(trimmedName).subscribe({
      next: (client) => {
        this.clients.update((items) => [...items, client]);
        this.errorMessage.set('');
        onSuccess?.();
      },
      error: () => {
        this.errorMessage.set('Auftraggeber konnte nicht angelegt werden.');
      },
    });
  }
}
