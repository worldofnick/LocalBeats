import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { CommonPipesModule } from "../../pipes/common/common-pipes.module";
import { 
  MatProgressBarModule,
  MatButtonModule,
  MatInputModule,
  MatCardModule,
  MatSlideToggleModule,
  MatCheckboxModule,
  MatSelectModule,
  MatIconModule,
  MatStepperModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AuthComponent } from "./auth.component";
import { RegisterComponent } from './register/register.component';
import { AuthRoutes } from "./auth.routing";

@NgModule({
  imports: [
    CommonModule,
    CommonPipesModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatSelectModule,
    MatButtonModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatInputModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    FlexLayoutModule,
    RecaptchaFormsModule,
    RecaptchaModule.forRoot(),
    RouterModule.forChild(AuthRoutes)
  ],
  declarations: [AuthComponent, RegisterComponent]
})
export class AuthModule { }
