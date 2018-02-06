import { CommonModule } from '@angular/common';
import { 
  MatDialogModule,
  MatIconModule,
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatProgressBarModule,
  MatCheckboxModule
 } from '@angular/material';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NegotiateDialogComponent } from './negotiate-dialog/negotiate-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [NegotiateDialogComponent],
  declarations: [NegotiateDialogComponent],
  providers: [],
  entryComponents: [NegotiateDialogComponent]
})
export class NegotiateModule { }