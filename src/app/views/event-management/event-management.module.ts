import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  MatSlideToggleModule,
  MatChipsModule,
  MatSidenavModule,
  MatExpansionModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatListModule,
  MatTooltipModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatMenuModule,
  MatSnackBarModule,
  MatGridListModule,
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatCardModule,
  MatButtonToggleModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatProgressBarModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { CommonPipesModule } from "../../pipes/common/common-pipes.module";
import { ReactiveFormsModule } from '@angular/forms';
import { EventManagementComponent, ConfirmPaymentDialog } from './event-management.component';
import { EventManagementRoutes } from './event-management.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatSidenavModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatListModule,
    MatTooltipModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatGridListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatProgressBarModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    CommonPipesModule,
    RouterModule.forChild(EventManagementRoutes)
  ],
  declarations: [EventManagementComponent, ConfirmPaymentDialog],
  exports: [
      EventManagementComponent,
      ConfirmPaymentDialog
  ],
  providers: [],
  entryComponents: [ConfirmPaymentDialog]
})
export class EventManagementModule { }
