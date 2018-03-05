import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { SearchService } from '../../services/search/search.service'

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  results: any;
  searchType: string;
  length = 100;
  pageSize = 15;
  pageSizeOptions = [15, 25, 50];
  distancesInMiles = [5, 10, 20, 50, 100];
  sortTypes = ["Best Match", "Distance", "Price High to Low", "Price Low to High", "Soonest"];

  constructor(private searchService: SearchService) { }

  ngOnInit() {
    this.searchService.results.subscribe(results => this.results = results);
    this.searchService.searchType.subscribe(searchType => this.searchType = searchType);
  }
  
  private pageEvent(pageEvent: PageEvent) {
    // Scroll to top of page 
    window.scrollTo(0, 0);
  }

}
