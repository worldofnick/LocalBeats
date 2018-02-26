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
    selector: 'app-review-dialog',
    templateUrl: './review-dialog.component.html',
    styleUrls: ['./review-dialog.component.css']

  })
  export class ReviewDialogComponent implements OnInit {
    reviewForm: FormGroup;
    currentReview: Review =  new Review;

    constructor(
      public dialogRef: MatDialogRef<ReviewDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private formBuilder: FormBuilder) {
        this.currentReview = data.review;
       }

    // this needs to be ngOnInit, not onInit.
    ngOnInit() {
      this.createForm();
      console.log(this.currentReview)
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    onYesClick(form: NgForm): void {
      console.log('printing rating: ', this.reviewForm.get('rating'));
      this.currentReview.title = this.reviewForm.get('title').value;
      this.currentReview.text = this.reviewForm.get('text').value;
      this.currentReview.rating = this.reviewForm.get('rating').value;
      this.currentReview.date = new Date();
      this.currentReview.flagCount = 0;
      this.currentReview._id = null;
      this.dialogRef.close(this.currentReview);
    }

    createForm() {
      this.reviewForm = this.formBuilder.group({
        title: new FormControl('', [
          Validators.required
        ]),
        text: new FormControl('', [
          Validators.required
        ]),
        rating: new FormControl('', [
          Validators.required
        ]),
        });
    }
}
