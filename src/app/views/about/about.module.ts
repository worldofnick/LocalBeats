import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatGridListModule,
  MatChipsModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTabsModule,
  MatInputModule,
  MatProgressBarModule
 } from '@angular/material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonPipesModule } from "../../pipes/common/common-pipes.module";
import { MatPaginatorModule } from '@angular/material/paginator';
import { AboutComponent } from './about.component';
import { AboutRoutes } from "./about.routing";



@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatChipsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatInputModule,
    MatProgressBarModule,
    FlexLayoutModule,
    ChartsModule,
    NgxDatatableModule,
    CommonPipesModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    RouterModule.forChild(AboutRoutes)
  ],
  declarations: [AboutComponent],
  exports: []
})
export class AboutModule {

}