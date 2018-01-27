import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Booking } from 'app/models/booking';

@Component({
  selector: 'app-negotiate-dialog',
  templateUrl: './negotiate-dialog.component.html',
  styleUrls: ['./negotiate-dialog.component.css']
})
export class NegotiateDialogComponent implements OnInit {
  negotiationForm: FormGroup;
  acceptButtonText: string = "Accept";
  declineButtonText: string = "Decline";
  initialPrice: number;
  negotiable: boolean;
  title: string = "Offer";
  subtext: string = "Please enter your offer or accept the current price:";

  constructor(
    public dialogRef: MatDialogRef<NegotiateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{booking: Booking, user:string},
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    console.log(this.data);
    console.log(this.data.booking);
    console.log(this.data.user);
    this.negotiable = this.data.booking.eventEID.negotiable;
    this.initialPrice = this.data.booking.currentPrice;
    if(this.data.booking.approved) {
      this.negotiationForm = this.formBuilder.group({
        price: new FormControl({value: this.data.booking.currentPrice, disabled: true}, Validators.required)
      });
      this.initialPrice = this.data.booking.currentPrice;

      this.title = "Booking";
      this.subtext = "This is your current agreed price.  Would you like to cancel the booking?"
      this.acceptButtonText = "Yes";
      this.declineButtonText = "No";

    } else if(!this.data.booking.approved){
      this.negotiationForm = this.formBuilder.group({
        price: new FormControl({value: this.data.booking.currentPrice, disabled: !this.negotiable}, Validators.required)
      });
    
      if(this.negotiable) {
        this.title = "Offer";
        this.subtext = "Please enter your bid or accept the current price:"
      } else {
        this.title = "Offer";
        this.subtext = "Are you sure you want to bid this amount?"
      }
    }

  }

  accept() {
    if(this.data.booking.approved) {
      this.dialogRef.close({accepted: 'cancel'});
    } else {
      if(this.negotiationForm.get('price').value != this.initialPrice) {
        this.dialogRef.close({accepted: 'new', price: this.negotiationForm.get('price').value});
      } else {
        this.dialogRef.close({accepted: 'accepted', price: this.negotiationForm.get('price').value});
      }
    }
  }

  decline() {
    if(this.data.booking.approved) {
      this.dialogRef.close({accepted: 'nocancel'});
    } else {
      this.dialogRef.close({accepted: 'declined'});
    }
  }

  onPriceChange(){
    if(this.negotiationForm.get('price').value != this.initialPrice) {
      this.acceptButtonText = "Bid"
    } else {
      this.acceptButtonText = "Accept";
    }
  }

}
