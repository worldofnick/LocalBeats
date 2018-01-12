import { Routes } from '@angular/router';

import { AppGalleryComponent } from './app-gallery/app-gallery.component';
import { AppPricingComponent } from './app-pricing/app-pricing.component';
import { AppUsersComponent } from './app-users/app-users.component';
import { AppBlankComponent } from './app-blank/app-blank.component';

export const OthersRoutes: Routes = [
  {
    path: '',
    children: [{
      path: 'gallery',
      component: AppGalleryComponent,
      data: { title: 'Gallery', breadcrumb: 'GALLERY' }
    }, {
      path: 'pricing',
      component: AppPricingComponent,
      data: { title: 'Pricing', breadcrumb: 'PRICINGS' }
    }, {
      path: 'users',
      component: AppUsersComponent,
      data: { title: 'Users', breadcrumb: 'USERS' }
    }, {
      path: 'blank',
      component: AppBlankComponent,
      data: { title: 'Blank', breadcrumb: 'BLANK' }
    }]
  }
];