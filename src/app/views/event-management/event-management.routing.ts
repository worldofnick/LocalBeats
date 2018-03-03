import { Routes } from '@angular/router';
import { EventManagementComponent } from './event-management.component';

export const EventManagementRoutes: Routes = [
  {
    path: '',
    component: EventManagementComponent,
    data: { title: 'My Events', breadcrumb: 'EVENTS'},
  }
];