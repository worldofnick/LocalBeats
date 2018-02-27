import { CommonModule } from '@angular/common';
import { CurrencyMaskModule } from "ng2-currency-mask";
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
import { VerifyDialogComponent } from './verify-dialog/verify-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CurrencyMaskModule,
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
  exports: [NegotiateDialogComponent, VerifyDialogComponent],
  declarations: [NegotiateDialogComponent, VerifyDialogComponent],
  providers: [],
  entryComponents: [NegotiateDialogComponent, VerifyDialogComponent]
})
export class NegotiateModule { }