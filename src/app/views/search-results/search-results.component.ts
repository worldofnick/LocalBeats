import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search/search.service'

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  results: any;
  searchType: string;
  constructor(private searchService: SearchService) { }

  ngOnInit() {
    this.searchService.results.subscribe(results => this.results = results);
    this.searchService.searchType.subscribe(searchType => this.searchType = searchType);
  }

}
