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
  genres = ['Rock', 'Country', 'Jazz', 'Blues', 'Hip Hop'];
  types = ['Wedding', 'Birthday', 'Business']

  model = new SearchTerms('', '', this.genres[0], this.types[0]);

  submitted = false;

  constructor(private router: Router) { }
  
  ngOnInit() {

  }

  onSubmit() { 
    console.log(this.model)
    this.router.navigate(['/search-result']);
  }
}
