import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { 
  MatIconModule,
  MatCardModule,
  MatMenuModule,
  MatProgressBarModule,
  MatButtonModule,
  MatChipsModule,
  MatListModule,
  MatGridListModule,
  MatPaginator,
  MatSelectModule
 } from '@angular/material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonPipesModule } from "../../pipes/common/common-pipes.module";
import { MatPaginatorModule } from '@angular/material/paginator';
import { SearchResultsComponent } from './search-results.component';
import { SearchRoutes } from "./search.routing";

@NgModule({
  imports: [
    CommonModule,
    CurrencyMaskModule,
    MatIconModule,
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
    MatPaginatorModule,
    MatSelectModule,
    RouterModule.forChild(SearchRoutes)
  ],
  declarations: [SearchResultsComponent],
  exports: []
})
export class SearchModule {

}