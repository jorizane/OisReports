import { Routes } from '@angular/router';

import { CustomerDeletePage } from './customer-delete-page.component';
import { CustomersPage } from './customers-page.component';

export const routes: Routes = [
  { path: '', component: CustomersPage },
  { path: 'customers/:id/edit', component: CustomerDeletePage },
  { path: '**', redirectTo: '' },
];
