import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Customer, CustomersService } from './customers.service';

@Component({
  selector: 'app-customer-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-detail-page.component.html',
  styleUrl: './customer-detail-page.component.scss',
})
export class CustomerDetailPage implements OnInit {
  protected readonly customer = signal<Customer | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor(
    private readonly customersService: CustomersService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      this.errorMessage.set('Kunde nicht gefunden.');
      return;
    }

    this.isLoading.set(true);
    this.customersService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Kunde nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }
}
