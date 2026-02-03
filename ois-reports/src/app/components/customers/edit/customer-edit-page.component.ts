import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Customer, CustomersService } from '../../../services/customers/customers.service';

@Component({
  selector: 'app-customer-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-edit-page.component.html',
  styleUrl: './customer-edit-page.component.scss',
})
export class CustomerEditPage implements OnInit {
  protected readonly customers = signal<Customer[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editMode = signal(false);
  protected readonly selectedCustomer = signal<Customer | null>(null);
  protected readonly showConfirm = signal(false);
  protected readonly successMessage = signal('');
  protected editName = '';
  private successTimer: number | null = null;

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
            this.editName = match.name;
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
        this.showSuccess(`Kunde "${customer.name}" wurde gelöscht.`);
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

  saveChanges(): void {
    const customer = this.selectedCustomer();
    if (!customer) {
      return;
    }

    const name = this.editName.trim();
    if (!name) {
      this.errorMessage.set('Bitte einen Kundennamen eingeben.');
      return;
    }

    this.customersService.updateCustomer(customer.id, name).subscribe({
      next: (updated) => {
        this.selectedCustomer.set(updated);
        this.editName = updated.name;
        this.showSuccess(`Kunde "${updated.name}" wurde aktualisiert.`);
      },
      error: () => {
        this.errorMessage.set('Kunde konnte nicht aktualisiert werden.');
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
