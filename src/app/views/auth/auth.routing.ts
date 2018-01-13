import { Routes } from '@angular/router';

import { AuthComponent } from "./auth.component";
import { RegisterComponent } from "./register/register.component";

export const AuthRoutes: Routes = [
  {
    path: '',
    component: AuthComponent
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Register', breadcrumb: 'REGISTER' }
  }
];