import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { Review } from '../../../models/review';
import { ReviewService } from '../../../services/reviews/review.service';
import { $ } from 'protractor';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { SocketService } from '../../../services/chats/socket.service';
import { SocketEvent } from '../../../services/chats/model/event';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";



@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css']
})
export class ProfileOverviewComponent implements OnInit {

  @Input() user: User;
  @Input() onOwnProfile: boolean;

  averageRating: any;


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
    private router: Router) { }

  ngOnInit() {
    // get reviews to this user.
    this.route.params.subscribe(params => {
      this.updateModel(params['id']);
    });
    if (this.user) {
      this.setReviews();
    }
  }

  setReviews() {
    this.reviewService.getReviewsTo(this.user).then((reviewList: Review[]) => {
      this.reviews = reviewList;
      let sum = 0;
      for (let review of this.reviews){
        sum += review.rating;
      }
      this.averageRating = sum / this.reviews.length;
      this.averageRating = this.averageRating.toFixed(1);
    });
  }


  openDialog(): void {

    let review: Review = new Review;
    review.toUser = this.user;
    review.fromUser = this.userService.user;
    this.reviewService.review(review, false).subscribe((result) => {
      if(result.rating == -1) {
        return;
      }
      this.reviewService.createReview(result).then( (newReview: Review) => {
          this.setReviews();
      });
    });

  }

  clickedReviewer(user: User) {
    if(this.userService.isAuthenticated()) {
      if(user._id == this.userService.user._id) {
        this.router.navigate(['/profile']);
      }else {
        this.router.navigate(['/profile', user._id])
      }
    }else {
      this.router.navigate(['/profile', user._id])
    }

  }

  editReview(review: Review) {
    this.reviewService.review(review, true).subscribe((result) => {
      console.log(result)
      if (result.rating == -1) {
        console.log('-1');
        return;
      }else if (result.rating == -2) {
        this.reviewService.deleteReviewByRID(result).then( () => {
          this.setReviews();
        });
      }else {
        console.log('else');
        this.reviewService.updateReview(review).then( () => {
          this.setReviews();
        });
      }
    });
  }

  updateModel(id: any) {
    this.userService.getUserByID(id).then( (user: User) => {
      this.user = user;
      this._socketService.sendToProfile('updateProfile', this.user);
    });

  }



}
