import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './components/common/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './components/common/layouts/auth-layout/auth-layout.component';

import { UserGuard } from './services/auth/user-guard.service';

export const rootRouterConfig: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  {
    path: '', 
    component: AdminLayoutComponent,
    children: [
      { 
        path: 'home', 
        loadChildren: './views/home/home.module#HomeModule', 
        data: { title: 'Home', breadcrumb: 'HOME'}
      },
      { 
        path: 'search', 
        loadChildren: './views/search-results/search.module#SearchModule',
        data: { title: 'Search', breadcrumb: 'SEARCH'}
      },
      { 
        path: 'dashboard', 
        loadChildren: './views/dashboard/dashboard.module#DashboardModule',
        canActivate: [UserGuard], 
        data: { title: 'Dashboard', breadcrumb: 'DASHBOARD'}
      },
      {
        path: 'profile', 
        loadChildren: './views/profile/profile.module#ProfileModule', 
        // canActivate: [UserGuard], 
        data: { title: 'Profile', breadcrumb: 'PROFILE'}
      },
      {
        path: 'bookingmanagement',
        loadChildren: './views/booking-management/booking-management.module#BookingManagementModule',
        data: { title: 'Booking Management', breadcrumb: 'MY BOOKINGS'}
      },
      {
        path: 'events', 
        loadChildren: './views/events/events.module#EventsModule', 
        //canActivate: [UserGuard], 
        data: { title: 'Events', breadcrumb: 'EVENTS'}
      },
      {
        path: 'auth', 
        loadChildren: './views/auth/auth.module#AuthModule', 
        data: { title: 'Authenticate', breadcrumb: 'AUTHENTICATE'}
      },
      {
        path: 'calendar', 
        loadChildren: './views/app-calendar/app-calendar.module#AppCalendarModule',
        canActivate: [UserGuard],  
        data: { title: 'Calendar', breadcrumb: 'CALENDAR'}
      },
      {
        path: 'chat',
        loadChildren: './views/app-chats/app-chats.module#AppChatsModule',
        canActivate: [UserGuard],  
        data: { title: 'Chat', breadcrumb: 'CHAT'}
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: 'sessions/404'
  }
];

