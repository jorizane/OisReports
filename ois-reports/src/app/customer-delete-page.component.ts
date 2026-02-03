import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Customer, CustomersService } from './customers.service';

@Component({
  selector: 'app-customer-delete-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-delete-page.component.html',
  styleUrl: './customer-delete-page.component.scss',
})
export class CustomerDeletePage implements OnInit {
  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editMode = signal(false);
  protected readonly selectedCustomer = signal<Customer | null>(null);
  protected readonly showConfirm = signal(false);
  protected readonly successMessage = signal('');

  constructor(
    private readonly customersService: CustomersService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.customersService.listCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.isLoading.set(false);

        const idParam = this.route.snapshot.paramMap.get('id');
        const id = idParam ? Number(idParam) : null;
        if (id) {
          const match = customers.find((item) => item.id === id);
          if (match) {
            this.editMode.set(true);
            this.selectedCustomer.set(match);
          } else {
            this.errorMessage.set('Kunde nicht gefunden.');
          }
        }
      },
      error: () => {
        this.errorMessage.set('Kunde konnte nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  promptDelete(): void {
    if (!this.selectedCustomer()) {
      return;
    }
    this.showConfirm.set(true);
  }

  cancelDelete(): void {
    this.showConfirm.set(false);
  }

  confirmDelete(): void {
    const customer = this.selectedCustomer();
    if (!customer) {
      return;
    }

    this.customersService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.showConfirm.set(false);
        this.selectedCustomer.set(null);
        this.editMode.set(false);
        this.successMessage.set(`Kunde "${customer.name}" wurde gelöscht.`);
        window.setTimeout(() => {
          this.router.navigate(['/'], {
            state: { deletedCustomer: customer.name },
          });
        }, 800);
      },
      error: () => {
        this.errorMessage.set('Kunde konnte nicht gelöscht werden.');
        this.showConfirm.set(false);
      },
    });
  }
}
