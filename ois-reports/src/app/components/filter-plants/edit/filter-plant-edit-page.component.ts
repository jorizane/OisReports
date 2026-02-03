import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  FilterPlant,
  FilterPlantsService,
} from '../../../services/filter-plants/filter-plants.service';
import {
  Manufacturer,
  ManufacturersService,
} from '../../../services/manufacturers/manufacturers.service';

@Component({
  selector: 'app-filter-plant-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './filter-plant-edit-page.component.html',
  styleUrl: './filter-plant-edit-page.component.scss',
})
export class FilterPlantEditPage implements OnInit {
  protected readonly plant = signal<FilterPlant | null>(null);
  protected readonly manufacturers = signal<Manufacturer[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showConfirm = signal(false);
  protected readonly successMessage = signal('');
  protected description = '';
  protected yearBuilt: number | null = null;
  protected selectedManufacturerId: number | null = null;
  private successTimer: number | null = null;

  constructor(
    private readonly filterPlantsService: FilterPlantsService,
    private readonly manufacturersService: ManufacturersService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('plantId');
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      this.errorMessage.set('Filteranlage nicht gefunden.');
      return;
    }

    this.isLoading.set(true);
    this.filterPlantsService.getFilterPlant(id).subscribe({
      next: (plant) => {
        this.plant.set(plant);
        this.description = plant.description;
        this.yearBuilt = plant.year_built;
        this.selectedManufacturerId = plant.manufacturer_id ?? null;
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Filteranlage nicht gefunden.');
        this.isLoading.set(false);
      },
    });

    this.loadManufacturers();
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

  saveChanges(): void {
    const plant = this.plant();
    if (!plant) {
      return;
    }

    const description = this.description.trim();
    const year = this.yearBuilt ?? 0;

    if (!description) {
      this.errorMessage.set('Bitte eine Beschreibung eingeben.');
      return;
    }

    if (year < 1800 || year > 2100) {
      this.errorMessage.set('Bitte ein gültiges Baujahr eingeben.');
      return;
    }

    if (!this.selectedManufacturerId) {
      this.errorMessage.set('Bitte einen Hersteller auswählen.');
      return;
    }

    this.filterPlantsService
      .updateFilterPlant(plant.id, {
        description,
        year_built: year,
        manufacturer_id: this.selectedManufacturerId,
      })
      .subscribe({
        next: (updated) => {
          this.plant.set(updated);
          this.description = updated.description;
          this.yearBuilt = updated.year_built;
          this.selectedManufacturerId = updated.manufacturer_id ?? null;
          this.showSuccess('Filteranlage wurde aktualisiert.');
        },
        error: () => {
          this.errorMessage.set('Filteranlage konnte nicht aktualisiert werden.');
        },
      });
  }

  promptDelete(): void {
    if (!this.plant()) {
      return;
    }
    this.showConfirm.set(true);
  }

  cancelDelete(): void {
    this.showConfirm.set(false);
  }

  confirmDelete(): void {
    const plant = this.plant();
    if (!plant) {
      return;
    }

    this.filterPlantsService.deleteFilterPlant(plant.id).subscribe({
      next: () => {
        this.showConfirm.set(false);
        this.showSuccess('Filteranlage wurde gelöscht.');
        window.setTimeout(() => {
          this.router.navigate(['/customers', plant.customer_id], {
            state: { deletedPlant: plant.description },
          });
        }, 800);
      },
      error: () => {
        this.errorMessage.set('Filteranlage konnte nicht gelöscht werden.');
        this.showConfirm.set(false);
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
