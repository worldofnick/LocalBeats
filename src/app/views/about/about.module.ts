import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  MatIconModule,
  MatCardModule,
  MatInputModule,
  MatMenuModule,
  MatProgressBarModule,
  MatButtonModule,
  MatChipsModule,
  MatListModule,
  MatGridListModule
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
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatMenuModule,
    MatProgressBarModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatGridListModule,
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