import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Manufacturer,
  ManufacturersService,
} from '../../../services/manufacturers/manufacturers.service';

@Component({
  selector: 'app-manufacturers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manufacturers-page.component.html',
  styleUrl: './manufacturers-page.component.scss',
})
export class ManufacturersPage implements OnInit {
  protected readonly manufacturers = signal<Manufacturer[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected newManufacturerName = '';
  private successTimer: number | null = null;

  constructor(private readonly manufacturersService: ManufacturersService) {}

  ngOnInit(): void {
    this.loadManufacturers();
  }

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

  addManufacturer(): void {
    const name = this.newManufacturerName.trim();
    if (!name) {
      this.errorMessage.set('Bitte einen Herstellernamen eingeben.');
      return;
    }

    this.manufacturersService.createManufacturer(name).subscribe({
      next: (manufacturer) => {
        this.manufacturers.update((items) => [...items, manufacturer]);
        this.newManufacturerName = '';
        this.errorMessage.set('');
        this.showSuccess('Hersteller wurde angelegt.');
      },
      error: () => {
        this.errorMessage.set('Hersteller konnte nicht angelegt werden.');
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
