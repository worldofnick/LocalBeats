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
import { PerformanceManagementComponent, PaymentHistoryDialog, RefundPaymentDialog } from './performance-management.component';
import { PerformanceManagementRoutes } from './performance-management.routing';

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
    RouterModule.forChild(PerformanceManagementRoutes)
  ],
  declarations: [
    PerformanceManagementComponent, 
    PaymentHistoryDialog,
    RefundPaymentDialog
  ],
  exports: [
    PerformanceManagementComponent,
    PaymentHistoryDialog,
    RefundPaymentDialog
  ],
  providers: [],
  entryComponents: [
    PaymentHistoryDialog, 
    RefundPaymentDialog
  ]
})
export class PerformanceManagementModule { }
