import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Customer = {
  id: number;
  name: string;
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected newCustomerName = '';

  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.get<Customer[]>('http://localhost:8000/customers').subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load customers.');
        this.isLoading.set(false);
      }
    });
  }

  addCustomer(): void {
    const name = this.newCustomerName.trim();
    if (!name) {
      this.errorMessage.set('Please enter a customer name.');
      return;
    }

    this.http
      .post<Customer>('http://localhost:8000/customers', { name })
      .subscribe({
        next: (customer) => {
          this.customers.update((items) => [...items, customer]);
          this.newCustomerName = '';
          this.errorMessage.set('');
        },
        error: () => {
          this.errorMessage.set('Failed to create customer.');
        }
      });
  }
}
