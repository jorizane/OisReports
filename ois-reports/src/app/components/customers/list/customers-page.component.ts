import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomersStore } from '../../../stores/customers/customers.store';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss',
})
export class CustomersPage implements OnInit {
  protected readonly customers;
  protected readonly clients;
  protected readonly isLoading;
  protected readonly errorMessage;
  protected readonly successMessage = signal('');
  private successTimer: number | null = null;

  constructor(private readonly customersStore: CustomersStore) {
    this.customers = this.customersStore.customers;
    this.clients = this.customersStore.clients;
    this.isLoading = this.customersStore.isLoading;
    this.errorMessage = this.customersStore.errorMessage;
  }

  ngOnInit(): void {
    const state = window.history.state as { deletedCustomer?: string };
    if (state?.deletedCustomer) {
      this.showSuccess(`Kunde "${state.deletedCustomer}" wurde gelöscht.`);
    }
    this.customersStore.loadClients();
    this.customersStore.loadCustomers();
  }

  getClientName(clientId: number): string {
    return this.customersStore.getClientName(clientId);
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
