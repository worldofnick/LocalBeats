import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { Review } from '../../../models/review';
import { ReviewService } from '../../../services/reviews/review.service';
import { $ } from 'protractor';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


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
  }]

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private reviewService: ReviewService,
              public dialog: MatDialog) { }

  ngOnInit() {
    // get reviews to this user.
    if (this.user) {
      console.log(this.onOwnProfile);
      this.reviewService.getReviewsTo(this.user).then((reviewList: Review[]) => {
        this.reviews = reviewList;
      });
    }

    // this.eventService.getEventByEID(this.EID).then((event: Event) => {

  }


  reviewUser() {
    const date: Date = new Date();
    const newReview: Review = new Review(null, 'best review', 'hello world', 4,
                      this.userService.user, this.user, date, 0);
    this.reviewService.createReview(newReview).then((review: Review) => {
      console.log('created review', review);
    });
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '250px',
      data: { name: this.name, animal: this.animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

}

@Component({
  selector: 'review-dialog',
  templateUrl: 'review-dialog.html',
})
export class ReviewDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close();
  }

}
