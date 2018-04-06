import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { User } from '../../../models/user';
import { ISubscription } from "rxjs/Subscription";
import { Review } from '../../../models/review';
import { ReviewService } from '../../../services/reviews/review.service';
import { $ } from 'protractor';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { SocketService } from '../../../services/chats/socket.service';
import { SocketEvent } from '../../../services/chats/model/event';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";
import { PageEvent } from '@angular/material';
import { MatPaginatorModule } from '@angular/material/paginator';


@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css']
})
export class ProfileOverviewComponent implements OnInit {

  @Input() user: User;
  @Input() onOwnProfile: boolean;
  private loginSub: ISubscription;

  averageRating: any;
  numberCompletedReviews: any = 0;
  pageIndex: number = 0;
  pageSize = 3; // default page size is 15
  pageSizeOptions = [3];
  results: any[] = [];
  allResults: any[] = [];

  userID: any = null;
  reviews: Review[] = [];
  activityData = [{
    month: 'January',
    spent: 240,
    opened: 8,
    closed: 30
  }, {
    month: 'February',
    spent: 140,
    opened: 6,
    closed: 20
  }, {
    month: 'March',
    spent: 220,
    opened: 10,
    closed: 20
  }, {
    month: 'April',
    spent: 440,
    opened: 40,
    closed: 60
  }, {
    month: 'May',
    spent: 340,
    opened: 40,
    closed: 60
  }];

  photos = [{
    name: 'Featured Restaurant',
    url: 'assets/images/coffee-shop-pic.jpg'
  }, {
    name: 'Featured Concert',
    url: 'assets/images/concert-pic.jpeg'
  }, {
    name: 'Featured Wedding',
    url: 'assets/images/wedding-pic.jpg'
  }];

  constructor(private route: ActivatedRoute,
    private userService: UserService,
    private reviewService: ReviewService,
    public dialog: MatDialog,
    private _socketService: SocketService,
    private router: Router,
    private bookingService: BookingService) { }

  ngOnInit() {

    if (this.user) {
      this.setReviews();
    }
  }

  setReviews() {
    this.reviewService.getReviewsTo(this.user).then((reviewList: Review[]) => {
      this.allResults = reviewList;
      let sum = 0;
      for (let review of this.allResults){
        if(review.booking.bothReviewed){
          sum += review.rating;
          this.numberCompletedReviews++;
        }
      }
      
      this.updateResults();
      this.averageRating = sum / this.numberCompletedReviews;
      this.averageRating = this.averageRating.toFixed(1);

      this.user.averageRating = this.averageRating;
      // this.userService.onEditProfile(this.user).then( (user:User) => {
      //   this.userService.user = user;
      // });
    });
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
