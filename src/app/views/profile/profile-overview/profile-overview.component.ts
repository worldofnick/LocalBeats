import { Component, OnInit, Input, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';
import { Review } from '../../../models/review';
import { ReviewService } from '../../../services/reviews/review.service';
import { $ } from 'protractor';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
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

    let dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '500px',
      data: { name: this.user.firstName}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result == null){
        return;
      }
      let currentReview: Review = new Review();
      console.log('The dialog was closed', result);
      const date: Date = new Date();
      currentReview._id = null;
      currentReview.date = date;
      currentReview.title = result.title.value;
      currentReview.text = result.text.value;
      currentReview.toUser = this.user;
      currentReview.rating = 0;
      currentReview.fromUser = this.userService.user;
      currentReview.flagCount = 0;
      console.log('about to create', currentReview);
      this.reviewService.createReview(currentReview).then((review: Review) => {
        console.log('created review ');
        this.reviews.push(currentReview);
      });
    });
  }

}



/*********************************************
 *********************************************
 *       Review Dialog Component
 *********************************************
 *********************************************/



@Component({
  selector: 'app-review-dialog',
  templateUrl: 'review-dialog.html',
})
export class ReviewDialogComponent {

  reviewForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private _socketService: SocketService) { }


  // this needs to be ngOnInit, not onInit.
  ngOnInit() {
    this.createForm();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(form: NgForm): void {
    this.dialogRef.close({title: this.reviewForm.get('title'), text: this.reviewForm.get('text')});
  }

  createForm() {
    this.reviewForm = this.formBuilder.group({
      title: new FormControl('', [
        Validators.required
      ]),
      text: new FormControl('', [
        Validators.required
      ]),
      });
  }

}
