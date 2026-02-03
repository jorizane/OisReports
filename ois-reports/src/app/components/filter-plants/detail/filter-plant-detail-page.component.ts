import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  Component as PlantComponent,
  ComponentsService,
} from '../../../services/components/components.service';
import {
  FilterPlant,
  FilterPlantsService,
} from '../../../services/filter-plants/filter-plants.service';
import {
  Manufacturer,
  ManufacturersService,
} from '../../../services/manufacturers/manufacturers.service';

@Component({
  selector: 'app-filter-plant-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './filter-plant-detail-page.component.html',
  styleUrl: './filter-plant-detail-page.component.scss',
})
export class FilterPlantDetailPage implements OnInit {
  protected readonly plant = signal<FilterPlant | null>(null);
  protected readonly components = signal<PlantComponent[]>([]);
  protected readonly manufacturers = signal<Manufacturer[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showComponentForm = signal(false);
  protected readonly componentError = signal('');
  protected readonly componentSuccess = signal('');
  protected componentName = '';
  protected customerId: number | null = null;
  private componentSuccessTimer: number | null = null;

  constructor(
    private readonly filterPlantsService: FilterPlantsService,
    private readonly manufacturersService: ManufacturersService,
    private readonly componentsService: ComponentsService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('plantId');
    const customerIdParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    this.customerId = customerIdParam ? Number(customerIdParam) : null;
    if (!id || !this.customerId) {
      this.errorMessage.set('Filteranlage nicht gefunden.');
      return;
    }

    const state = window.history.state as { deletedComponent?: string };
    if (state?.deletedComponent) {
      this.showComponentSuccess(`Komponente "${state.deletedComponent}" wurde gelöscht.`);
    }

    this.isLoading.set(true);
    this.filterPlantsService.getFilterPlant(id).subscribe({
      next: (plant) => {
        this.plant.set(plant);
        this.isLoading.set(false);
        this.loadComponents(plant.id);
      },
      error: () => {
        this.errorMessage.set('Filteranlage nicht gefunden.');
        this.isLoading.set(false);
      },
    });

    this.loadManufacturers();
  }

  getManufacturerName(manufacturerId: number | null | undefined): string {
    if (!manufacturerId) {
      return 'Nicht zugeordnet';
    }
    const match = this.manufacturers().find((item) => item.id === manufacturerId);
    return match ? match.name : 'Unbekannt';
  }

  private loadManufacturers(): void {
    this.manufacturersService.listManufacturers().subscribe({
      next: (manufacturers) => {
        this.manufacturers.set(manufacturers);
      },
      error: () => {
        this.errorMessage.set('Hersteller konnten nicht geladen werden.');
      },
    });
  }

  private loadComponents(filterPlantId: number): void {
    this.componentsService.listComponents(filterPlantId).subscribe({
      next: (components) => {
        this.components.set(components);
      },
      error: () => {
        this.errorMessage.set('Komponenten konnten nicht geladen werden.');
      },
    });
  }

  toggleComponentForm(): void {
    this.componentError.set('');
    this.componentSuccess.set('');
    this.showComponentForm.set(!this.showComponentForm());
  }

  createComponent(): void {
    const plant = this.plant();
    if (!plant) {
      return;
    }

    const name = this.componentName.trim();
    if (!name) {
      this.componentError.set('Bitte einen Namen eingeben.');
      return;
    }

    this.componentsService.createComponent(plant.id, { name }).subscribe({
      next: (component) => {
        this.components.update((items) => [...items, component]);
        this.componentName = '';
        this.componentError.set('');
        this.showComponentForm.set(false);
        this.showComponentSuccess('Komponente wurde angelegt.');
      },
      error: () => {
        this.componentError.set('Komponente konnte nicht angelegt werden.');
      },
    });
  }

  dismissComponentSuccess(): void {
    this.clearComponentSuccess();
  }

  private showComponentSuccess(message: string): void {
    this.clearComponentSuccess();
    this.componentSuccess.set(message);
    this.componentSuccessTimer = window.setTimeout(() => {
      this.clearComponentSuccess();
    }, 2200);
  }

  private clearComponentSuccess(): void {
    if (this.componentSuccessTimer !== null) {
      window.clearTimeout(this.componentSuccessTimer);
      this.componentSuccessTimer = null;
    }
    this.componentSuccess.set('');
  }
}
