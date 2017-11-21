import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

  //push every review fro db here. reviews.push / on contrucotr
  reviews = ['firstReview', 'secondReview']
  constructor() { }

  ngOnInit() {
  }

}
