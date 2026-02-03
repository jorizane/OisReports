import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CustomersService, FilterPlant } from './customers.service';

@Component({
  selector: 'app-filter-plant-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './filter-plant-detail-page.component.html',
  styleUrl: './filter-plant-detail-page.component.scss',
})
export class FilterPlantDetailPage implements OnInit {
  protected readonly plant = signal<FilterPlant | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor(
    private readonly customersService: CustomersService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('plantId');
    const id = idParam ? Number(idParam) : null;
    if (!id) {
      this.errorMessage.set('Filteranlage nicht gefunden.');
      return;
    }

    this.isLoading.set(true);
    this.customersService.getFilterPlant(id).subscribe({
      next: (plant) => {
        this.plant.set(plant);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Filteranlage nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }
}
