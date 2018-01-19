import { Routes } from '@angular/router';

import { ProfileComponent } from "./profile.component";
import { ProfileOverviewComponent } from "./profile-overview/profile-overview.component";
import { ProfileSettingsComponent } from "./profile-settings/profile-settings.component";
import { ProfileBlankComponent } from "./profile-blank/profile-blank.component";
import { ProfileEventsComponent} from "./profile-events/profile-events.component";

export const ProfileRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    data: { title: 'Profile', breadcrumb: 'PROFILE'},
    children: [{
      path: 'overview',
      component: ProfileOverviewComponent,
      data: { title: 'Overview', breadcrumb: 'OVERVIEW' }
    }, 
    {
      path: 'settings',
      component: ProfileSettingsComponent,
      data: { title: 'Settings', breadcrumb: 'SETTINGS' }
    }, 
    {
      path: 'events',
      component: ProfileEventsComponent,
      data: { title: 'Events', breadcrumb: 'EVENTS' }
    }, 
    {
      path: 'blank',
      component: ProfileBlankComponent,
      data: { title: 'Blank', breadcrumb: 'BLANK' }
    }]
  },
  {
    path: ':id',
    component: ProfileComponent,
    data: { title: 'Profile', breadcrumb: 'OTHER PROFILE' },
  }, 
  {
    path: 'overview/:id',
    component: ProfileOverviewComponent,
    data: { title: 'Other Overview', breadcrumb: 'OTHER Overview' },
  }, 
];