import { Injectable, signal } from '@angular/core';

import {
  Manufacturer,
  ManufacturersService,
} from '../../services/manufacturers/manufacturers.service';

@Injectable({ providedIn: 'root' })
export class ManufacturersStore {
  readonly manufacturers = signal<Manufacturer[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly manufacturersService: ManufacturersService) {}

  loadManufacturers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.manufacturersService.listManufacturers().subscribe({
      next: (manufacturers) => {
        this.manufacturers.set(manufacturers);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Hersteller konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }

  addManufacturer(name: string, onSuccess?: () => void): void {
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.errorMessage.set('Bitte einen Herstellernamen eingeben.');
      return;
    }

    this.manufacturersService.createManufacturer(trimmedName).subscribe({
      next: (manufacturer) => {
        this.manufacturers.update((items) => [...items, manufacturer]);
        this.errorMessage.set('');
        onSuccess?.();
      },
      error: () => {
        this.errorMessage.set('Hersteller konnte nicht angelegt werden.');
      },
    });
  }
}
