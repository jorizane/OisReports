import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  Manufacturer,
  ManufacturersService,
} from '../../../services/manufacturers/manufacturers.service';
import {
  FilterPlant,
  FilterPlantsService,
} from '../../../services/filter-plants/filter-plants.service';

@Component({
  selector: 'app-manufacturer-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manufacturer-detail-page.component.html',
  styleUrl: './manufacturer-detail-page.component.scss',
})
export class ManufacturerDetailPage implements OnInit {
  protected readonly manufacturer = signal<Manufacturer | null>(null);
  protected readonly filterPlants = signal<FilterPlant[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor(
    private readonly manufacturersService: ManufacturersService,
    private readonly filterPlantsService: FilterPlantsService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      this.errorMessage.set('Hersteller nicht gefunden.');
      return;
    }

    this.isLoading.set(true);
    this.manufacturersService.getManufacturer(id).subscribe({
      next: (manufacturer) => {
        this.manufacturer.set(manufacturer);
        this.isLoading.set(false);
        this.loadFilterPlants(manufacturer.id);
      },
      error: () => {
        this.errorMessage.set('Hersteller nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }

  private loadFilterPlants(manufacturerId: number): void {
    this.filterPlantsService.listFilterPlantsByManufacturer(manufacturerId).subscribe({
      next: (plants) => {
        this.filterPlants.set(plants);
      },
      error: () => {
        this.errorMessage.set('Filteranlagen konnten nicht geladen werden.');
      },
    });
  }
}
