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
    isEditing:boolean;

    constructor(
      public dialogRef: MatDialogRef<ReviewDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private formBuilder: FormBuilder) {
        this.currentReview = data.review;
        this.isEditing = data.isEditing;

       }

    // this needs to be ngOnInit, not onInit.
    ngOnInit() {
      this.createForm();    }

    onNoClick(): void {
      const emptyReview: Review = new Review;
      emptyReview.rating = -1;
      this.dialogRef.close(emptyReview);
    }

    onYesClick(form: NgForm): void {
      this.currentReview.title = this.reviewForm.get('title').value;
      this.currentReview.text = this.reviewForm.get('text').value;
      this.currentReview.rating = this.reviewForm.get('rating').value;
      if (!this.isEditing) {
        //creating new review
        this.currentReview.flagCount = 0;
        this.currentReview.date = new Date();
        this.currentReview._id = null;
      }
      this.dialogRef.close(this.currentReview);
    }

    createForm() {

      if(this.currentReview.rating){
        this.reviewForm = this.formBuilder.group({
          title: new FormControl(this.currentReview.title, [
            Validators.required
          ]),
          text: new FormControl(this.currentReview.text, [
            Validators.required
          ]),
          rating: new FormControl(this.currentReview.rating.toString(), [
            Validators.required
          ]),
          });
      }else{
        this.reviewForm = this.formBuilder.group({
          title: new FormControl(this.currentReview.title, [
            Validators.required
          ]),
          text: new FormControl(this.currentReview.text, [
            Validators.required
          ]),
          rating: new FormControl('', [
            Validators.required
          ]),
          });
      }

    }
}
