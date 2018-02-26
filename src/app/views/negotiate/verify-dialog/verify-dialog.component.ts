import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Booking, VerificationResponse } from 'app/models/booking';
import { User } from '../../../models/user';

@Component({
  selector: 'app-verify-dialog',
  templateUrl: './verify-dialog.component.html',
  styleUrls: ['./verify-dialog.component.css']
})
export class VerifyDialogComponent implements OnInit {
  verificationForm: FormGroup;
  hasStripe: boolean = false;
  acceptButtonText: string = "Yes";
  declineButtonText: string = "No";
  title: string = "Event Verification & Payment";
  subtext: string = "Has the artist arrived at your event and is prepared to perform as agreed upon?  If so, please click yes to process payment.";

  constructor(
    public dialogRef: MatDialogRef<VerifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{booking: Booking, isHost: boolean},
    private formBuilder: FormBuilder
  ) {
    if(this.data.isHost && this.data.booking.hostUser.stripeAccountId != null) {
      this.hasStripe = true;
    } else if(!this.data.isHost && this.data.booking.performerUser.stripeAccountId != null) {
      this.hasStripe = true;
    } else {
      this.hasStripe = false;
    }
  }

  ngOnInit() {
    if(!this.data.isHost) {
      this.subtext = "Have you arrived at the event and are the host's terms as agreed upon?  If so, please click yes to process payment."
    }
    this.verificationForm = this.formBuilder.group({
      comment: new FormControl()
    });
  }

  verify() {
    this.dialogRef.close({response: VerificationResponse.verify, comment: this.verificationForm.get('comment').value});
  }

  reject() {
    this.dialogRef.close({response: VerificationResponse.reject, comment: this.verificationForm.get('comment').value});
  }

}
