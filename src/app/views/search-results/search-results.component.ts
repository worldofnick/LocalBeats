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
  allResults: any;
  pageIndex: number = 0;
  searchType: string;
  
  pageSize = 15; // default page size is 15
  pageSizeOptions = [15, 25, 50];

  constructor(private searchService: SearchService) { }

  ngOnInit() {
    this.searchService.results.subscribe(results => {
      this.allResults = results;
      this.results = results;
      this.pageIndex = 0; // go to the first page when a new search is made
      this.updateResults();

    });
    this.searchService.searchType.subscribe(searchType => this.searchType = searchType);
  }
  
  private pageEvent(pageEvent: PageEvent) {
    this.pageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    this.updateResults();
    // Scroll to top of page 
    window.scrollTo(0, 0);
  }

  private updateResults() {
    let startingIndex = (this.pageIndex + 1) * this.pageSize - this.pageSize;
    let endIndex = startingIndex + this.pageSize;
    var i: number;

    this.results = Array<any>();
    // Slice the results array
    for (i = startingIndex; i < endIndex && i < this.allResults.length; i++) {
      this.results.push(this.allResults[i]);
    }

  }

}
