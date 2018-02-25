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

    constructor(
      public dialogRef: MatDialogRef<ReviewDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private formBuilder: FormBuilder) { }

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