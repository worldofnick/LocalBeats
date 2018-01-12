import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  MatInputModule,
  MatCardModule,
  MatListModule,
  MatButtonModule
 } from '@angular/material';
import { AppConfirmModule } from '../../services/app-confirm/app-confirm.module';
import { AppLoaderModule } from '../../services/app-loader/app-loader.module';

import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { LoaderDialogComponent } from './loader-dialog/loader-dialog.component';

import { DialogsRoutes } from "./app-dialogs.routing";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    AppConfirmModule,
    AppLoaderModule,
    RouterModule.forChild(DialogsRoutes)
  ],
  declarations: [ConfirmDialogComponent, LoaderDialogComponent]
})
export class AppDialogsModule { }
