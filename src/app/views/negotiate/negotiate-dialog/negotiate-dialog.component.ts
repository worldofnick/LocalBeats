import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Booking, NegotiationResponses } from 'app/models/booking';
import { Event } from 'app/models/event';
// Services
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { UserService } from '../../../services/auth/user.service';
import { SocketService } from '../../../services/chats/socket.service';
import {
  startOfDay,
  endOfDay,
  subDays,
  addMinutes,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  isWithinRange
} from 'date-fns';

@Component({
  selector: 'app-negotiate-dialog',
  templateUrl: './negotiate-dialog.component.html',
  styleUrls: ['./negotiate-dialog.component.css']
})
export class NegotiateDialogComponent implements OnInit {
  negotiationForm: FormGroup;
  acceptButtonText: string = "Accept";
  declineButtonText: string = "Decline";
  originalButtonText: string;
  initialPrice: number;
  negotiable: boolean;
  title: string = "Offer";
  subtext: string = "Please enter your offer or accept the current price:";

  constructor(
    public dialogRef: MatDialogRef<NegotiateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{booking: Booking, initial: boolean, view: string, artistAvail: string},
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.negotiable = this.data.booking.eventEID.negotiable;
    this.initialPrice = this.data.booking.currentPrice;

    // Check if the booking has been approved and if it's negotiable
    if(this.negotiable && !this.data.booking.approved) {
      this.negotiationForm = this.formBuilder.group({
        price: new FormControl({value: this.initialPrice, disabled: false}, [Validators.required, Validators.min(0), Validators.pattern("^[0-9]+(\.[0-9][0-9])?$")]),
        comment: new FormControl()
      });
    } else {
      this.negotiationForm = this.formBuilder.group({
        price: new FormControl({value: this.initialPrice, disabled: true}, [Validators.required]),
        comment: new FormControl()
      });
    }
    // Check whether it's an initial booking application or request
    if(this.data.initial) {
      // Check if artist application
      if(this.data.booking.bookingType == 'artist-apply') {
        // Check if the event is negotiable
        if(this.negotiable) {
          this.title = "Artist Bid";
          this.subtext = "Please enter a new bid or accept the listed price of the host."
          this.acceptButtonText = "Bid";
          this.declineButtonText = "Cancel Bid";
        } else {
          this.title = "Artist Application"
          this.subtext = "This event is non-negotiable.  Please confirm your application for the listed price."
          this.acceptButtonText = "Apply";
          this.declineButtonText = "Cancel Application";
        }
      } else {
        // Otherwise, it is a host request
        // Check if the event is negotiable
        if(this.negotiable) {
          this.title = "Host Offer";
          this.subtext = "Please enter a new proposed price or request the artist at your event's currently listed price."
          this.acceptButtonText = "Offer";
          this.declineButtonText = "Cancel Offer";
        } else {
          this.title = "Host Request";
          this.subtext = "You have set this event as non-negotiable.  Please confirm your request for this artist at your listed price."
          this.acceptButtonText = "Request";
          this.declineButtonText = "Cancel Request";
        }
      }
    } else if(!this.data.booking.approved){
      // Check what view it's coming from
      if(this.data.view == 'artist') {
        // Check to see who is the most recent approval of the offer
        if(this.data.booking.hostApproved && this.negotiable) {
          // Host has done the most recent offer
          this.title = "Host's Current Offer";
          this.subtext = "Please enter a new bid or accept the host's offer to confirm the booking."
          this.acceptButtonText = "Accept";
          this.declineButtonText = "Decline";
        } else if (this.data.booking.hostApproved && !this.negotiable) {
          this.title = "Host's Offer";
          this.subtext = "This event is non-negotiable.  Please accept or decline the host's listed price to confirm the booking."
          this.acceptButtonText = "Accept";
          this.declineButtonText = "Decline";
        } else if (this.data.booking.artistApproved && this.negotiable) {
          this.title = "Your Current Offer";
          this.subtext = "Please enter a new bid, accept your current bid, or cancel your application."
          this.acceptButtonText = "Accept";
          this.declineButtonText = "Cancel Bid";
        } else {
          this.title = "Artist Application";
          this.subtext = "This event is non-negotiable.  Would you like to maintain your application?";
          this.acceptButtonText = "Confirm Application";
          this.declineButtonText = "Cancel Application";
        }
      } else {
        // It's coming from the host
        // Check to see who is the most recent approval of the offer
        // Check to see who is the most recent approval of the offer
        if(this.data.booking.hostApproved && this.negotiable) {
          this.title = "Your Current Offer";
          this.subtext = "Please enter a new offer, accept your current offer, or cancel the request."
          this.acceptButtonText = "Accept";
          this.declineButtonText = "Cancel Request";
        } else if (this.data.booking.hostApproved && !this.negotiable) {
          this.title = "Your Offer";
          this.subtext = "You made this event non-negotiable.  Please accept or decline the artist's application at your listed price."
          this.acceptButtonText = "Accept";
          this.declineButtonText = "Decline";
        } else if (this.data.booking.artistApproved && this.negotiable) {
          this.title = "Artist's Current Bid";
          this.subtext = "Please enter a new offer or accept the artist's bid to confirm the booking."
          this.acceptButtonText = "Accept";
          this.declineButtonText = "Decline";
        } else {
          this.title = "Artist's Application";
          this.subtext = "You made this event non-negotiable.  Please accept or decline the artist's application.";
          this.acceptButtonText = "Confirm Application";
          this.declineButtonText = "Cancel Application";
        }
      } 
    } else {
      // The booking has been approved.
      this.title = "Confirmed Booking";
      this.subtext = "Would you like to keep or cancel your booking?"
      this.acceptButtonText = "Keep Booking";
      this.declineButtonText = "Cancel Booking";
    }
    this.originalButtonText = this.acceptButtonText;

  }

  accept() {
    if(this.data.booking.approved) {
      this.dialogRef.close({response: NegotiationResponses.nochange, price: this.initialPrice, comment: this.negotiationForm.get('comment').value});
    } else {
      if(this.negotiationForm.get('price').value != this.initialPrice || this.data.initial) {
        this.dialogRef.close({response: NegotiationResponses.new, price: this.negotiationForm.get('price').value, comment: this.negotiationForm.get('comment').value});
      } else {
        this.dialogRef.close({response: NegotiationResponses.accept, price: this.negotiationForm.get('price').value, comment: this.negotiationForm.get('comment').value});
      }
    }
  }

  decline() {
    if(this.data.booking.approved) {
      this.dialogRef.close({response: NegotiationResponses.cancel, price: this.initialPrice, comment: this.negotiationForm.get('comment').value});
    } else {
      this.dialogRef.close({response: NegotiationResponses.decline, price: this.initialPrice, comment: this.negotiationForm.get('comment').value});
    }
  }

  onPriceChange(){
    if(this.negotiationForm.get('price').value != this.initialPrice) {
      if(this.data.booking.hostApproved && this.negotiable && this.data.view == 'artist') {
        this.acceptButtonText = "Counter Bid";
      } else if(this.data.booking.artistApproved && this.negotiable && this.data.view == 'artist') {
        this.acceptButtonText = "New Bid";
      } else if(this.data.booking.hostApproved && this.negotiable && this.data.view == 'host') {
        this.acceptButtonText = "New Offer";
      } else {
        this.acceptButtonText = "Counter Offer";
      }
    } else {
      this.acceptButtonText = this.originalButtonText;
    }
  }

}
