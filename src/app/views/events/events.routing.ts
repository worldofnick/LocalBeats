import { Routes } from '@angular/router';

import { CreateEventsComponent } from "./create-events/create-events.component"
import { EventsComponent } from "./events.component"
import { EventSingletonComponent } from "./event-singleton/event-singleton.component"


export const EventRoutes: Routes = [
  {
    path: '',
    component: CreateEventsComponent,
    data: { title: 'MyEvents', breadcrumb: 'My Events'},
  },
  {
    path: ':id',
    component: EventSingletonComponent,
    data: { title: 'Event', breadcrumb: 'Event'}},
  {
    path: 'update/:id',
    component: CreateEventsComponent,
    data: { title: 'Event', breadcrumb: 'Event'},
  
  }
];