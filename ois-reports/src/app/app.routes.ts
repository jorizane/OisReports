import { Routes } from '@angular/router';

import { CustomerDetailPage } from './customer-detail-page.component';
import { CustomerEditPage } from './customer-edit-page.component';
import { CustomersPage } from './customers-page.component';

export const routes: Routes = [
  { path: '', component: CustomersPage },
  { path: 'customers/:id', component: CustomerDetailPage },
  { path: 'customers/:id/edit', component: CustomerEditPage },
  { path: '**', redirectTo: '' },
];
