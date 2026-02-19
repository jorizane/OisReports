import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { LoginPageComponent } from './components/auth/login/login-page.component';
import { CustomersPage } from './components/customers/list/customers-page.component';
import { CustomerDetailPage } from './components/customers/detail/customer-detail-page.component';
import { CustomerEditPage } from './components/customers/edit/customer-edit-page.component';
import { ClientsPage } from './components/clients/list/clients-page.component';
import { ClientCreatePage } from './components/clients/create/client-create-page.component';
import { FilterPlantDetailPage } from './components/filter-plants/detail/filter-plant-detail-page.component';
import { FilterPlantEditPage } from './components/filter-plants/edit/filter-plant-edit-page.component';
import { ComponentDetailPage } from './components/components/detail/component-detail-page.component';
import { ComponentEditPage } from './components/components/edit/component-edit-page.component';
import { ReportCreatePage } from './components/reports/create/report-create-page.component';
import { ReportDetailPage } from './components/reports/detail/report-detail-page.component';
import { ReportEditPage } from './components/reports/edit/report-edit-page.component';
import { ReportsPage } from './components/reports/list/reports-page.component';
import { ManufacturersPage } from './components/manufacturers/list/manufacturers-page.component';
import { ManufacturerDetailPage } from './components/manufacturers/detail/manufacturer-detail-page.component';
import { ManufacturerCreatePage } from './components/manufacturers/create/manufacturer-create-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', component: CustomersPage, canActivate: [authGuard] },
  { path: 'clients/new', component: ClientCreatePage, canActivate: [authGuard] },
  { path: 'clients', component: ClientsPage, canActivate: [authGuard] },
  { path: 'customers/new', component: CustomerEditPage, canActivate: [authGuard] },
  { path: 'customers/:id', component: CustomerDetailPage, canActivate: [authGuard] },
  {
    path: 'customers/:id/filter-plants/new',
    component: FilterPlantEditPage,
    canActivate: [authGuard],
  },
  {
    path: 'customers/:id/filter-plants/:plantId',
    component: FilterPlantDetailPage,
    canActivate: [authGuard],
  },
  {
    path: 'customers/:id/filter-plants/:plantId/reports/new',
    component: ReportCreatePage,
    canActivate: [authGuard],
  },
  { path: 'reports/:reportId', component: ReportDetailPage, canActivate: [authGuard] },
  { path: 'reports/:reportId/edit', component: ReportEditPage, canActivate: [authGuard] },
  { path: 'reports', component: ReportsPage, canActivate: [authGuard] },
  { path: 'manufacturers/new', component: ManufacturerCreatePage, canActivate: [authGuard] },
  { path: 'manufacturers/:id', component: ManufacturerDetailPage, canActivate: [authGuard] },
  { path: 'manufacturers', component: ManufacturersPage, canActivate: [authGuard] },
  {
    path: 'customers/:id/filter-plants/:plantId/components/new',
    component: ComponentEditPage,
    canActivate: [authGuard],
  },
  {
    path: 'customers/:id/filter-plants/:plantId/components/:componentId',
    component: ComponentDetailPage,
    canActivate: [authGuard],
  },
  {
    path: 'customers/:id/filter-plants/:plantId/components/:componentId/edit',
    component: ComponentEditPage,
    canActivate: [authGuard],
  },
  {
    path: 'customers/:id/filter-plants/:plantId/edit',
    component: FilterPlantEditPage,
    canActivate: [authGuard],
  },
  { path: 'customers/:id/edit', component: CustomerEditPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
