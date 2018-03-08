import { Routes } from '@angular/router';
import { EventManagementComponent } from './event-management/event-management.component';
import { PerformanceManagementComponent } from './performance-management/performance-management.component';

export const BookingManagementRoutes: Routes = [
  {
    path: 'myevents',
    component: EventManagementComponent,
    data: { title: 'My Events', breadcrumb: 'EVENTS'},
  },
  {
    path: 'myperformances',
    component: PerformanceManagementComponent,
    data: { title: 'My Performances', breadcrumb: 'PERFORMANCES'},
  }
];