import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  Component as PlantComponent,
  ComponentsService,
} from '../../../services/components/components.service';
import { Client, ClientsService } from '../../../services/clients/clients.service';
import { Customer, CustomersService } from '../../../services/customers/customers.service';
import {
  FilterPlant,
  FilterPlantsService,
} from '../../../services/filter-plants/filter-plants.service';
import { ReportsService } from '../../../services/reports/reports.service';

type ComponentInput = {
  id: number;
  name: string;
  description: string;
};

@Component({
  selector: 'app-report-create-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './report-create-page.component.html',
  styleUrl: './report-create-page.component.scss',
})
export class ReportCreatePage implements OnInit {
  protected readonly components = signal<ComponentInput[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly customer = signal<Customer | null>(null);
  protected readonly plant = signal<FilterPlant | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected customerId: number | null = null;
  protected plantId: number | null = null;
  protected selectedClientId: number | null = null;
  private successTimer: number | null = null;

  constructor(
    private readonly componentsService: ComponentsService,
    private readonly clientsService: ClientsService,
    private readonly customersService: CustomersService,
    private readonly filterPlantsService: FilterPlantsService,
    private readonly reportsService: ReportsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const customerIdParam = this.route.snapshot.paramMap.get('id');
    const plantIdParam = this.route.snapshot.paramMap.get('plantId');
    this.customerId = customerIdParam ? Number(customerIdParam) : null;
    this.plantId = plantIdParam ? Number(plantIdParam) : null;

    if (!this.customerId || !this.plantId) {
      this.errorMessage.set('Filteranlage nicht gefunden.');
      return;
    }

    this.loadClients();
    this.loadCustomer();
    this.loadPlant();

    this.isLoading.set(true);
    this.componentsService.listComponents(this.plantId).subscribe({
      next: (components) => {
        this.components.set(
          components.map((component) => ({
            id: component.id,
            name: component.name,
            description: '',
          }))
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Komponenten konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  private loadClients(): void {
    this.clientsService.listClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
      },
      error: () => {
        this.errorMessage.set('Auftraggeber konnten nicht geladen werden.');
      },
    });
  }

  private loadCustomer(): void {
    if (!this.customerId) {
      return;
    }
    this.customersService.getCustomer(this.customerId).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.selectedClientId = customer.client_id ?? null;
      },
      error: () => {
        this.errorMessage.set('Kunde konnte nicht geladen werden.');
      },
    });
  }

  private loadPlant(): void {
    if (!this.plantId) {
      return;
    }
    this.filterPlantsService.getFilterPlant(this.plantId).subscribe({
      next: (plant) => {
        this.plant.set(plant);
      },
      error: () => {
        this.errorMessage.set('Filteranlage konnte nicht geladen werden.');
      },
    });
  }

  saveReport(): void {
    if (!this.customerId || !this.plantId) {
      return;
    }

    const payload = this.components().map((component) => ({
      component_id: component.id,
      description: component.description.trim(),
    }));

    if (payload.some((item) => !item.description)) {
      this.errorMessage.set('Bitte alle Beschreibungen ausfüllen.');
      return;
    }

    this.reportsService
      .createReport(this.customerId, this.plantId, { component_descriptions: payload })
      .subscribe({
        next: () => {
          this.showSuccess('Bericht wurde zwischengespeichert.');
          window.setTimeout(() => {
            this.router.navigate([
              '/customers',
              this.customerId,
              'filter-plants',
              this.plantId,
            ]);
          }, 800);
        },
        error: () => {
          this.errorMessage.set('Bericht konnte nicht gespeichert werden.');
        },
      });
  }

  trackByComponentId(_: number, component: ComponentInput): number {
    return component.id;
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
