import { Routes } from '@angular/router';

import { MyEventsComponent } from "./my-events/my-events.component"
import { EventsComponent } from "./events.component"



export const EventRoutes: Routes = [
  {
    path: '',
    component: MyEventsComponent,
    data: { title: 'MyEvents', breadcrumb: 'My Events'},
    // children: [{
    //   path: 'events',
    //   component: MyEventsComponent,
    //   data: { title: 'Events', breadcrumb: 'EVENTS' }
    // } 
    // ]
  }
];