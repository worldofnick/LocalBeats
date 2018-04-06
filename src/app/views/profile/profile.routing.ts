import { Routes } from '@angular/router';

import { ProfileComponent } from "./profile.component";
import { ProfileOverviewComponent } from "./profile-overview/profile-overview.component";
import { ProfileSettingsComponent } from "./profile-settings/profile-settings.component";
import { ProfileBlankComponent } from "./profile-blank/profile-blank.component";

export const ProfileRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    data: { title: 'Profile', breadcrumb: 'PROFILE'},
  },
  {
    path: ':id',
    component: ProfileComponent,
    data: { title: 'Profile', breadcrumb: 'OTHER PROFILE' },
  }, 
];