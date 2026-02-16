import { Injectable, signal } from '@angular/core';

import { Client, ClientsService } from '../../services/clients/clients.service';
import { Customer, CustomersService } from '../../services/customers/customers.service';

@Injectable({ providedIn: 'root' })
export class CustomersStore {
  readonly customers = signal<Customer[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(
    private readonly customersService: CustomersService,
    private readonly clientsService: ClientsService
  ) {}

  loadClients(): void {
    this.clientsService.listClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
      },
      error: () => {
        this.errorMessage.set('Auftraggeber konnten nicht geladen werden.');
      },
    });
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.customersService.listCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Kunden konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  addCustomer(name: string, selectedClientId: number | null, onSuccess?: (customer: Customer) => void): void {
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.errorMessage.set('Bitte einen Kundennamen eingeben.');
      return;
    }

    if (!selectedClientId) {
      this.errorMessage.set('Bitte einen Auftraggeber auswählen.');
      return;
    }

    this.customersService.createCustomer(trimmedName, selectedClientId).subscribe({
      next: (customer) => {
        this.customers.update((items) => [...items, customer]);
        this.errorMessage.set('');
        onSuccess?.(customer);
      },
      error: () => {
        this.errorMessage.set('Kunde konnte nicht angelegt werden.');
      },
    });
  }

  getClientName(clientId: number): string {
    const match = this.clients().find((client) => client.id === clientId);
    return match ? match.name : 'Unbekannt';
  }
}
