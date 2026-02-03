import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Customer, CustomersService, FilterPlant } from './customers.service';

@Component({
  selector: 'app-customer-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-detail-page.component.html',
  styleUrl: './customer-detail-page.component.scss',
})
export class CustomerDetailPage implements OnInit {
  protected readonly customer = signal<Customer | null>(null);
  protected readonly filterPlants = signal<FilterPlant[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showPlantForm = signal(false);
  protected readonly plantError = signal('');
  protected readonly plantSuccess = signal('');
  protected plantDescription = '';
  protected plantYear: number | null = null;

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
        this.loadFilterPlants(customer.id);
      },
      error: () => {
        this.errorMessage.set('Kunde nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }

  private loadFilterPlants(customerId: number): void {
    this.customersService.listFilterPlants(customerId).subscribe({
      next: (plants) => {
        this.filterPlants.set(plants);
      },
      error: () => {
        this.errorMessage.set('Filteranlagen konnten nicht geladen werden.');
      },
    });
  }

  togglePlantForm(): void {
    this.plantError.set('');
    this.plantSuccess.set('');
    this.showPlantForm.set(!this.showPlantForm());
  }

  createFilterPlant(): void {
    const customer = this.customer();
    if (!customer) {
      return;
    }

    const description = this.plantDescription.trim();
    const year = this.plantYear ?? 0;

    if (!description) {
      this.plantError.set('Bitte eine Beschreibung eingeben.');
      return;
    }

    if (year < 1800 || year > 2100) {
      this.plantError.set('Bitte ein gültiges Baujahr eingeben.');
      return;
    }

    this.customersService
      .createFilterPlant(customer.id, { description, year_built: year })
      .subscribe({
        next: (plant) => {
          this.filterPlants.update((items) => [...items, plant]);
          this.plantDescription = '';
          this.plantYear = null;
          this.plantError.set('');
          this.plantSuccess.set('Filteranlage wurde angelegt.');
          this.showPlantForm.set(false);
        },
        error: () => {
          this.plantError.set('Filteranlage konnte nicht angelegt werden.');
        },
      });
  }
}
