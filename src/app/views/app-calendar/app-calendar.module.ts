import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  MatIconModule,
  MatDialogModule,
  MatButtonModule,
  MatCardModule,
  MatListModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CalendarModule } from 'angular-calendar';
import { AppCalendarComponent } from './app-calendar.component';
import { CalendarRoutes } from "./app-calendar.routing";

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    FlexLayoutModule,
    CalendarModule.forRoot(),
    RouterModule.forChild(CalendarRoutes)
  ],
  declarations: [AppCalendarComponent]
})
export class AppCalendarModule { }
