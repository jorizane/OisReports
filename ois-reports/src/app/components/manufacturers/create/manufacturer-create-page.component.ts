import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ManufacturersService } from '../../../services/manufacturers/manufacturers.service';

@Component({
  selector: 'app-manufacturer-create-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manufacturer-create-page.component.html',
  styleUrl: './manufacturer-create-page.component.scss',
})
export class ManufacturerCreatePage {
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected name = '';

  constructor(
    private readonly manufacturersService: ManufacturersService,
    private readonly router: Router
  ) {}

  saveManufacturer(): void {
    const name = this.name.trim();
    if (!name) {
      this.errorMessage.set('Bitte einen Herstellernamen eingeben.');
      return;
    }

    if (name.length > 100) {
      this.errorMessage.set('Name darf maximal 100 Zeichen haben.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.manufacturersService.createManufacturer(name).subscribe({
      next: (manufacturer) => {
        this.isLoading.set(false);
        this.router.navigate(['/manufacturers'], {
          state: { createdManufacturer: manufacturer.name },
        });
      },
      error: () => {
        this.errorMessage.set('Hersteller konnte nicht angelegt werden.');
        this.isLoading.set(false);
      },
    });
  }
}
