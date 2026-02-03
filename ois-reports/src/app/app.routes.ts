import { Routes } from '@angular/router';

import { CustomerDetailPage } from './customer-detail-page.component';
import { CustomerEditPage } from './customer-edit-page.component';
import { CustomersPage } from './customers-page.component';
import { FilterPlantDetailPage } from './filter-plant-detail-page.component';
import { FilterPlantEditPage } from './filter-plant-edit-page.component';

export const routes: Routes = [
  { path: '', component: CustomersPage },
  { path: 'customers/:id', component: CustomerDetailPage },
  { path: 'customers/:id/filter-plants/:plantId', component: FilterPlantDetailPage },
  { path: 'customers/:id/filter-plants/:plantId/edit', component: FilterPlantEditPage },
  { path: 'customers/:id/edit', component: CustomerEditPage },
  { path: '**', redirectTo: '' },
];
