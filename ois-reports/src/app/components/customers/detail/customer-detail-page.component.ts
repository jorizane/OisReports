import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Customer, CustomersService } from '../../../services/customers/customers.service';
import {
  FilterPlant,
  FilterPlantsService,
} from '../../../services/filter-plants/filter-plants.service';
import {
  Manufacturer,
  ManufacturersService,
} from '../../../services/manufacturers/manufacturers.service';
import { ReportRead, ReportsService } from '../../../services/reports/reports.service';

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
  protected readonly manufacturers = signal<Manufacturer[]>([]);
  protected readonly reports = signal<ReportRead[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly reportError = signal('');
  protected readonly showPlantForm = signal(false);
  protected readonly plantError = signal('');
  protected readonly plantSuccess = signal('');
  protected plantDescription = '';
  protected plantYear: number | null = null;
  protected selectedManufacturerId: number | null = null;
  private plantSuccessTimer: number | null = null;

  constructor(
    private readonly customersService: CustomersService,
    private readonly filterPlantsService: FilterPlantsService,
    private readonly manufacturersService: ManufacturersService,
    private readonly reportsService: ReportsService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      this.errorMessage.set('Kunde nicht gefunden.');
      return;
    }

    const state = window.history.state as { deletedPlant?: string };
    if (state?.deletedPlant) {
      this.showPlantSuccess(`Filteranlage "${state.deletedPlant}" wurde gelöscht.`);
    }

    this.isLoading.set(true);
    this.customersService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.isLoading.set(false);
        this.loadFilterPlants(customer.id);
        this.loadReports(customer.id);
      },
      error: () => {
        this.errorMessage.set('Kunde nicht gefunden.');
        this.isLoading.set(false);
      },
    });

    this.loadManufacturers();
  }

  private loadFilterPlants(customerId: number): void {
    this.filterPlantsService.listFilterPlants(customerId).subscribe({
      next: (plants) => {
        this.filterPlants.set(plants);
      },
      error: () => {
        this.errorMessage.set('Filteranlagen konnten nicht geladen werden.');
      },
    });
  }

  private loadReports(customerId: number): void {
    this.reportsService.listCustomerReports(customerId).subscribe({
      next: (reports) => {
        this.reports.set(reports);
      },
      error: () => {
        this.reportError.set('Berichte konnten nicht geladen werden.');
      },
    });
  }

  private loadManufacturers(): void {
    this.manufacturersService.listManufacturers().subscribe({
      next: (manufacturers) => {
        this.manufacturers.set(manufacturers);
      },
      error: () => {
        this.plantError.set('Hersteller konnten nicht geladen werden.');
      },
    });
  }

  getManufacturerName(manufacturerId: number): string {
    const match = this.manufacturers().find((item) => item.id === manufacturerId);
    return match ? match.name : 'Unbekannt';
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
    const manufacturerId = this.selectedManufacturerId;

    if (!description) {
      this.plantError.set('Bitte eine Beschreibung eingeben.');
      return;
    }

    if (year < 1800 || year > 2100) {
      this.plantError.set('Bitte ein gültiges Baujahr eingeben.');
      return;
    }

    if (!manufacturerId) {
      this.plantError.set('Bitte einen Hersteller auswählen.');
      return;
    }

    const payload = {
      description,
      year_built: year,
      manufacturer_id: manufacturerId,
    };

    this.filterPlantsService.createFilterPlant(customer.id, payload).subscribe({
        next: (plant) => {
          this.filterPlants.update((items) => [...items, plant]);
          this.plantDescription = '';
          this.plantYear = null;
          this.selectedManufacturerId = null;
          this.plantError.set('');
          this.showPlantSuccess('Filteranlage wurde angelegt.');
          this.showPlantForm.set(false);
        },
        error: () => {
          this.plantError.set('Filteranlage konnte nicht angelegt werden.');
        },
      });
  }

  dismissPlantSuccess(): void {
    this.clearPlantSuccess();
  }

  private showPlantSuccess(message: string): void {
    this.clearPlantSuccess();
    this.plantSuccess.set(message);
    this.plantSuccessTimer = window.setTimeout(() => {
      this.clearPlantSuccess();
    }, 2200);
  }

  private clearPlantSuccess(): void {
    if (this.plantSuccessTimer !== null) {
      window.clearTimeout(this.plantSuccessTimer);
      this.plantSuccessTimer = null;
    }
    this.plantSuccess.set('');
  }
}
