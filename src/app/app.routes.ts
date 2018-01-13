import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './components/common/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './components/common/layouts/auth-layout/auth-layout.component';

import { AuthGuard } from './services/auth/auth.guard';

export const rootRouterConfig: Routes = [
  { 
    path: '', 
    redirectTo: 'home', 
    pathMatch: 'full' 
  },
  {
    path: '', 
    component: AuthLayoutComponent,
    children: [
      { 
        path: 'sessions', 
        loadChildren: './views/sessions/sessions.module#SessionsModule',
        data: { title: 'Session'} 
      }
    ]
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
        path: 'dashboard', 
        loadChildren: './views/dashboard/dashboard.module#DashboardModule',
        canActivate: [AuthGuard], 
        data: { title: 'Dashboard', breadcrumb: 'DASHBOARD'}
      },
      {
        path: 'material', 
        loadChildren: './views/material/app-material.module#AppMaterialModule', 
        data: { title: 'Material', breadcrumb: 'MATERIAL'}
      },
      {
        path: 'dialogs', 
        loadChildren: './views/app-dialogs/app-dialogs.module#AppDialogsModule', 
        data: { title: 'Dialogs', breadcrumb: 'DIALOGS'}
      },
      {
        path: 'profile', 
        loadChildren: './views/profile/profile.module#ProfileModule', 
        data: { title: 'Profile', breadcrumb: 'PROFILE'}
      },
      {
        path: 'others', 
        loadChildren: './views/others/others.module#OthersModule', 
        data: { title: 'Others', breadcrumb: 'OTHERS'}
      },
      {
        path: 'tables', 
        loadChildren: './views/tables/tables.module#TablesModule', 
        data: { title: 'Tables', breadcrumb: 'TABLES'}
      },
      {
        path: 'tour', 
        loadChildren: './views/app-tour/app-tour.module#AppTourModule', 
        data: { title: 'Tour', breadcrumb: 'TOUR'}
      },
      {
        path: 'forms', 
        loadChildren: './views/forms/forms.module#AppFormsModule', 
        data: { title: 'Forms', breadcrumb: 'FORMS'}
      },
      {
        path: 'charts', 
        loadChildren: './views/charts/charts.module#AppChartsModule', 
        data: { title: 'Charts', breadcrumb: 'CHARTS'}
      },
      {
        path: 'map', 
        loadChildren: './views/map/map.module#AppMapModule', 
        data: { title: 'Map', breadcrumb: 'MAP'}
      },
      {
        path: 'dragndrop', 
        loadChildren: './views/dragndrop/dragndrop.module#DragndropModule', 
        data: { title: 'Drag and Drop', breadcrumb: 'DND'}
      },
      {
        path: 'inbox', 
        loadChildren: './views/app-inbox/app-inbox.module#AppInboxModule', 
        data: { title: 'Inbox', breadcrumb: 'INBOX'}
      },
      {
        path: 'calendar', 
        loadChildren: './views/app-calendar/app-calendar.module#AppCalendarModule', 
        data: { title: 'Calendar', breadcrumb: 'CALENDAR'}
      },
      {
        path: 'chat', 
        loadChildren: './views/app-chats/app-chats.module#AppChatsModule', 
        data: { title: 'Chat', breadcrumb: 'CHAT'}
      },
      {
        path: 'icons', 
        loadChildren: './views/mat-icons/mat-icons.module#MatIconsModule', 
        data: { title: 'Icons', breadcrumb: 'MATICONS'}
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: 'sessions/404'
  }
];

