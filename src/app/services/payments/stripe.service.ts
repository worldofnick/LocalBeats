// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { Event } from 'app/models/event';
import { Booking } from 'app/models/booking';
import { Payment } from 'app/models/payment';
import { AppModule } from 'app/app.module';

@Injectable()
export class StripeService {

  public connection: string = AppModule.currentHost + 'api/stripe';
  public connectionPayments: string = AppModule.currentHost + 'api/payments';
  private headers: Headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': sessionStorage.getItem('token')});

  constructor(private http: Http) { }

  // Send the user to the Stripe website
  public authorizeStripe(user: User): Promise<string> {
    const current = this.connection + '/authorize';
    return this.http.post(current, { user: user }, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
          const data = response.json();
          return data.redirect_url;
        })
        .catch(this.handleError);
  }

  // Sends the user to the Stripe website to view their account into
  public viewStripeTransfers(user: User): Promise<string> {
    const current = this.connection + '/transfers';
    return this.http.post(current, { user: user }, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
          const data = response.json();
          return data.redirect_url;
        })
        .catch(this.handleError);
  }

  // Makes a request to our backend to request the Stripe API to payout the user
  // Returns true if the payout was good, false otherwise
  public payoutUser(user: User): Promise<boolean> {
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
  public charge(booking: Booking): Promise<boolean> {
    const current = this.connection + '/charge';
    return this.http.post(current, { booking: booking }, { headers: this.headers })
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

  // Make a request to our backend to request the Stripe API to refund this payment
  public refund(payment: Payment): Promise<boolean> {
    const current = this.connection + '/refund';
    return this.http.post(current, { payment: payment }, { headers: this.headers })
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

  // Make a request to our backend to request the payment status for a booking
  public getBookingPaymentStatus(booking: Booking): Promise<string> {
    const current = this.connectionPayments + '/bookingPaymentStatus/?eid=' + booking.eventEID._id;
    return this.http.get(current, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
            const data = response.json();
            const status = data["status"];
            return status;
        })
        .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
      let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console
      return Promise.reject(errMsg);
  }

}
