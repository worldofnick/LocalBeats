import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Booking, VerificationResponse } from 'app/models/booking';

@Component({
  selector: 'app-verify-dialog',
  templateUrl: './verify-dialog.component.html',
  styleUrls: ['./verify-dialog.component.css']
})
export class VerifyDialogComponent implements OnInit {
  verificationForm: FormGroup;
  acceptButtonText: string = "Yes";
  declineButtonText: string = "No";
  title: string = "Event Verification";
  subtext: string = "Has the artist arrived at your event and is prepared to perform as agreed upon?";

  constructor(
    public dialogRef: MatDialogRef<VerifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{booking: Booking, isHost: boolean},
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    if(!this.data.isHost) {
      this.subtext = "Have you arrived at the event and are the host's terms as agreed upon?"
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
