import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Customer, CustomersService } from '../../../services/customers/customers.service';
import { Client, ClientsService } from '../../../services/clients/clients.service';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss',
})
export class CustomersPage implements OnInit {
  protected readonly customers = signal<Customer[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected newCustomerName = '';
  protected selectedClientId: number | null = null;
  private successTimer: number | null = null;

  constructor(
    private readonly customersService: CustomersService,
    private readonly clientsService: ClientsService
  ) {}

  ngOnInit(): void {
    const state = window.history.state as { deletedCustomer?: string };
    if (state?.deletedCustomer) {
      this.showSuccess(`Kunde "${state.deletedCustomer}" wurde gelöscht.`);
    }
    this.loadClients();
    this.loadCustomers();
  }

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

  addCustomer(): void {
    const name = this.newCustomerName.trim();
    if (!name) {
      this.errorMessage.set('Bitte einen Kundennamen eingeben.');
      return;
    }

    if (!this.selectedClientId) {
      this.errorMessage.set('Bitte einen Auftraggeber auswählen.');
      return;
    }

    this.customersService.createCustomer(name, this.selectedClientId).subscribe({
      next: (customer) => {
        this.customers.update((items) => [...items, customer]);
        this.newCustomerName = '';
        this.selectedClientId = null;
        this.errorMessage.set('');
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

  dismissSuccess(): void {
    this.clearSuccess();
  }

  private showSuccess(message: string): void {
    this.clearSuccess();
    this.successMessage.set(message);
    this.successTimer = window.setTimeout(() => {
      this.clearSuccess();
    }, 2200);
  }

  private clearSuccess(): void {
    if (this.successTimer !== null) {
      window.clearTimeout(this.successTimer);
      this.successTimer = null;
    }
    this.successMessage.set('');
  }
}
