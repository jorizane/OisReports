import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Customer, CustomersService } from './customers.service';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss',
})
export class CustomersPage implements OnInit {
  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected newCustomerName = '';
  private successTimer: number | null = null;

  constructor(private readonly customersService: CustomersService) {}

  ngOnInit(): void {
    const state = window.history.state as { deletedCustomer?: string };
    if (state?.deletedCustomer) {
      this.showSuccess(`Kunde "${state.deletedCustomer}" wurde gelöscht.`);
    }
    this.loadCustomers();
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

    this.customersService.createCustomer(name).subscribe({
      next: (customer) => {
        this.customers.update((items) => [...items, customer]);
        this.newCustomerName = '';
        this.errorMessage.set('');
      },
      error: () => {
        this.errorMessage.set('Kunde konnte nicht angelegt werden.');
      },
    });
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
