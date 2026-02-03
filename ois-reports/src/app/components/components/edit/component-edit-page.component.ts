import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  Component as PlantComponent,
  ComponentsService,
} from '../../../services/components/components.service';

@Component({
  selector: 'app-component-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './component-edit-page.component.html',
  styleUrl: './component-edit-page.component.scss',
})
export class ComponentEditPage implements OnInit {
  protected readonly component = signal<PlantComponent | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showConfirm = signal(false);
  protected readonly successMessage = signal('');
  protected name = '';
  protected customerId: number | null = null;
  protected plantId: number | null = null;
  private successTimer: number | null = null;

  constructor(
    private readonly componentsService: ComponentsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const componentIdParam = this.route.snapshot.paramMap.get('componentId');
    const customerIdParam = this.route.snapshot.paramMap.get('id');
    const plantIdParam = this.route.snapshot.paramMap.get('plantId');

    const componentId = componentIdParam ? Number(componentIdParam) : null;
    this.customerId = customerIdParam ? Number(customerIdParam) : null;
    this.plantId = plantIdParam ? Number(plantIdParam) : null;

    if (!componentId || !this.customerId || !this.plantId) {
      this.errorMessage.set('Komponente nicht gefunden.');
      return;
    }

    this.isLoading.set(true);
    this.componentsService.getComponent(componentId).subscribe({
      next: (component) => {
        this.component.set(component);
        this.name = component.name;
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Komponente nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }

  saveChanges(): void {
    const component = this.component();
    if (!component) {
      return;
    }

    const name = this.name.trim();
    if (!name) {
      this.errorMessage.set('Bitte einen Namen eingeben.');
      return;
    }

    this.componentsService.updateComponent(component.id, { name }).subscribe({
      next: (updated) => {
        this.component.set(updated);
        this.name = updated.name;
        this.showSuccess('Komponente wurde aktualisiert.');
      },
      error: () => {
        this.errorMessage.set('Komponente konnte nicht aktualisiert werden.');
      },
    });
  }

  promptDelete(): void {
    if (!this.component()) {
      return;
    }
    this.showConfirm.set(true);
  }

  cancelDelete(): void {
    this.showConfirm.set(false);
  }

  confirmDelete(): void {
    const component = this.component();
    if (!component || !this.customerId || !this.plantId) {
      return;
    }

    this.componentsService.deleteComponent(component.id).subscribe({
      next: () => {
        this.showConfirm.set(false);
        this.showSuccess('Komponente wurde gelöscht.');
        window.setTimeout(() => {
          this.router.navigate(['/customers', this.customerId, 'filter-plants', this.plantId], {
            state: { deletedComponent: component.name },
          });
        }, 800);
      },
      error: () => {
        this.errorMessage.set('Komponente konnte nicht gelöscht werden.');
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
