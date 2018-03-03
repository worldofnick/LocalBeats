import { Routes } from '@angular/router';
import { PerformanceManagementComponent } from './performance-management.component';

export const PerformanceManagementRoutes: Routes = [
  {
    path: '',
    component: PerformanceManagementComponent,
    data: { title: 'My Performances', breadcrumb: 'PERFORMANCES'},
  }
];