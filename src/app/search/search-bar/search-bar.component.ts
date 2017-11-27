import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { SearchTerms } from 'app/models/search';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  musicGenres = ['Rock', 'Country', 'Jazz', 'Blues', 'Hip Hop']
  eventTypes = ['Wedding', 'Birthday', 'Business']
  searchTerms: SearchTerms = {
    text: null,
    location: null,
    genre: null,
    type: null
  }

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onSearch(form: NgForm) {
    console.log(this.searchTerms);
    this.router.navigate(['/search-result']);
  }

}
