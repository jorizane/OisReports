import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CustomersService, Component as PlantComponent } from './customers.service';

@Component({
  selector: 'app-component-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './component-detail-page.component.html',
  styleUrl: './component-detail-page.component.scss',
})
export class ComponentDetailPage implements OnInit {
  protected readonly component = signal<PlantComponent | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  protected customerId: number | null = null;
  protected plantId: number | null = null;

  constructor(
    private readonly customersService: CustomersService,
    private readonly route: ActivatedRoute
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
    this.customersService.getComponent(componentId).subscribe({
      next: (component) => {
        this.component.set(component);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Komponente nicht gefunden.');
        this.isLoading.set(false);
      },
    });
  }
}
