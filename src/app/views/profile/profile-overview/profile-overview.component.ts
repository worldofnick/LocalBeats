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



@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css']
})
export class ProfileOverviewComponent implements OnInit {

  @Input() user: User;
  @Input() onOwnProfile: boolean;

  animal: string;
  name: string;

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
    private _socketService: SocketService) { }

  ngOnInit() {
    // get reviews to this user.
    if (this.user) {
      console.log(this.onOwnProfile);
      this.reviewService.getReviewsTo(this.user).then((reviewList: Review[]) => {
        this.reviews = reviewList;
      });
    }
  }


  openDialog(): void {

    this.reviewService.review(this.user, this.userService.user).subscribe((result) => {
      console.log('fin');
    });

  }
}
