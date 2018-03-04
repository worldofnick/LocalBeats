import { CommonModule } from '@angular/common';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { 
  MatDialogModule,
  MatIconModule,
  MatCardModule,
  MatInputModule,
  MatButtonModule,
  MatSelectModule,
  MatProgressBarModule,
  MatCheckboxModule
 } from '@angular/material';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ReviewDialogComponent } from './review-dialog/review-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CurrencyMaskModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [ReviewDialogComponent],
  declarations: [ReviewDialogComponent],
  providers: [],
  entryComponents: [ReviewDialogComponent]
})
export class ReviewModule { }