import { 
  MatDialogModule,
  MatIconModule,
  MatButtonModule
 } from '@angular/material';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NegotiateDialogComponent } from './negotiate-dialog/negotiate-dialog.component';

@NgModule({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
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