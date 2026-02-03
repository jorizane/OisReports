import { Routes } from '@angular/router';

import { CustomersPage } from './components/customers/list/customers-page.component';
import { CustomerDetailPage } from './components/customers/detail/customer-detail-page.component';
import { CustomerEditPage } from './components/customers/edit/customer-edit-page.component';
import { FilterPlantDetailPage } from './components/filter-plants/detail/filter-plant-detail-page.component';
import { FilterPlantEditPage } from './components/filter-plants/edit/filter-plant-edit-page.component';
import { ComponentDetailPage } from './components/components/detail/component-detail-page.component';
import { ComponentEditPage } from './components/components/edit/component-edit-page.component';
import { ReportCreatePage } from './components/reports/create/report-create-page.component';
import { ReportDetailPage } from './components/reports/detail/report-detail-page.component';
import { ReportsPage } from './components/reports/list/reports-page.component';
import { ManufacturersPage } from './components/manufacturers/list/manufacturers-page.component';
import { ManufacturerDetailPage } from './components/manufacturers/detail/manufacturer-detail-page.component';

export const routes: Routes = [
  { path: '', component: CustomersPage },
  { path: 'customers/:id', component: CustomerDetailPage },
  { path: 'customers/:id/filter-plants/:plantId', component: FilterPlantDetailPage },
  {
    path: 'customers/:id/filter-plants/:plantId/reports/new',
    component: ReportCreatePage,
  },
  { path: 'reports/:reportId', component: ReportDetailPage },
  { path: 'reports', component: ReportsPage },
  { path: 'manufacturers/:id', component: ManufacturerDetailPage },
  { path: 'manufacturers', component: ManufacturersPage },
  {
    path: 'customers/:id/filter-plants/:plantId/components/:componentId',
    component: ComponentDetailPage,
  },
  {
    path: 'customers/:id/filter-plants/:plantId/components/:componentId/edit',
    component: ComponentEditPage,
  },
  { path: 'customers/:id/filter-plants/:plantId/edit', component: FilterPlantEditPage },
  { path: 'customers/:id/edit', component: CustomerEditPage },
  { path: '**', redirectTo: '' },
];
