import { 
  MatDialogModule,
  MatButtonModule
 } from '@angular/material';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NegotiateDialogComponent } from './negotiate-dialog/negotiate-dialog.component';

@NgModule({
  imports: [
    MatDialogModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  exports: [NegotiateDialogComponent],
  declarations: [NegotiateDialogComponent],
  providers: [],
  entryComponents: [NegotiateDialogComponent]
})
export class NegotiateModule { }