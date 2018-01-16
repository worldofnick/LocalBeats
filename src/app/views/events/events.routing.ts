import { Routes } from '@angular/router';

import { CreateEventsComponent } from "./create-events/create-events.component"
import { EventsComponent } from "./events.component"



export const EventRoutes: Routes = [
  {
    path: '',
    component: CreateEventsComponent,
    data: { title: 'MyEvents', breadcrumb: 'My Events'},
    // children: [{
    //   path: 'events',
    //   component: MyEventsComponent,
    //   data: { title: 'Events', breadcrumb: 'EVENTS' }
    // } 
    // ]
  }
];