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
  path: 'event',
  component: EventSingletonComponent,
  data: { title: 'EVent', breadcrumb: 'Event'},}
];