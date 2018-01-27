import { Routes } from '@angular/router';
import { SearchResultsComponent } from './search-results.component';


export const SearchRoutes: Routes = [
  { path: '', component: SearchResultsComponent, data: { title: 'Search Results' } }
];