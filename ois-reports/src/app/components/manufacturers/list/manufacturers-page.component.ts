import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ManufacturersStore } from '../../../stores/manufacturers/manufacturers.store';

@Component({
  selector: 'app-manufacturers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manufacturers-page.component.html',
  styleUrl: './manufacturers-page.component.scss',
})
export class ManufacturersPage implements OnInit {
  protected readonly manufacturers;
  protected readonly isLoading;
  protected readonly errorMessage;
  protected readonly successMessage = signal('');
  protected newManufacturerName = '';
  private successTimer: number | null = null;

  constructor(private readonly manufacturersStore: ManufacturersStore) {
    this.manufacturers = this.manufacturersStore.manufacturers;
    this.isLoading = this.manufacturersStore.isLoading;
    this.errorMessage = this.manufacturersStore.errorMessage;
  }

  ngOnInit(): void {
    this.manufacturersStore.loadManufacturers();
  }

  addManufacturer(): void {
    this.manufacturersStore.addManufacturer(this.newManufacturerName, () => {
        this.newManufacturerName = '';
        this.showSuccess('Hersteller wurde angelegt.');
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
