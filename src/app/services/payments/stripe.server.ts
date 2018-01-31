// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Booking } from 'app/models/booking';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { Payment } from 'app/models/payment';
import { NegotiateDialogComponent } from '../../views/negotiate/negotiate-dialog/negotiate-dialog.component';

@Injectable()
export class StripeService {

  public connection: string = 'http://localhost:8080/api/stripe';
  private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: Http) { }

  // Send the user to the Stripe website
  public authorizeStripe(user: User) {

  }

  // Sends the user to the Stripe website to view their account into
  public viewTransfers(user: User) {

  }

  // Makes a request to our backend to request the Stripe API to payout the user
  // Returns true if the payout was good, false otherwise
  public payoutUser(user: User): boolean {
    const current = this.connection + '/payout';
    return this.http.post(current, { user: user }, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
            if (response.status == 200) {
              return true;
            } else {
              return false;
            }
        })
        .catch(this.handleError);
  }

  // Makes a request to our backend to request the Stripe API to charge the event host
  // This will need an extra visa parameter for event host stripe charge info
  public charge(event: Event) {

  }

  // Make a request to our backend to request the Stripe API to refund this payment
  public refund(payment: Payment) {

  }

}
