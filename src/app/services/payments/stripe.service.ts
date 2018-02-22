// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../../services/chats/socket.service';
import { User } from 'app/models/user';
import { Event } from 'app/models/event';
import { Booking } from 'app/models/booking';
import { Payment } from 'app/models/payment';
import { Notification } from '../../models/notification'
import { SocketEvent } from '../../services/chats/model/event'
import { environment } from '../../../environments/environment';

@Injectable()
export class StripeService {

  public connection: string = environment.apiURL + 'api/stripe'; 
  public connectionPayments: string = environment.apiURL + 'api/payments';
  private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: Http, private _socketService: SocketService) { }

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
            // Send notification
            let message = booking.hostUser.firstName + " " + booking.hostUser.lastName + " has paid you $" + booking.currentPrice +   " for " + booking.eventEID.eventName;
            let notification = new Notification(booking.hostUser, booking.performerUser, booking.eventEID._id,
              booking, null, message, "payment", ['/events', booking.eventEID._id]);
            this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
              return true;
            } else {
              return false;
            }
        })
        .catch(this.handleError);
  }

  // Make a request to our backend to request the Stripe API to refund this payment
  public refund(booking: Booking): Promise<boolean> {
    const current = this.connection + '/refund';
    return this.http.post(current, { booking: booking }, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
            if (response.status == 200) {
              // Send notification
              let message = booking.performerUser.firstName + " " + booking.performerUser.lastName + " has refunded you $" + booking.currentPrice +   " for " + booking.eventEID.eventName;
              let notification = new Notification(booking.performerUser, booking.hostUser, booking.eventEID._id,
                booking, null, message, "payment", ['/events', booking.eventEID._id]);
              this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
              return true;
            } else {
              return false;
            }
        })
        .catch(this.handleError);
  }

  public getBookingPayments(booking: Booking): Promise<Payment[]> {
    const current = this.connectionPayments + '/bookingPayments/?bid=' + booking._id;
    return this.http.get(current, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
            const data = response.json();           
            return data.payments as Payment[];
        })
        .catch(this.handleError);
}

  // Make a request to our backend to charge the user for cancelling
  // Returns true if successful, false otherwise.
  public cancelBookingFee(booking: Booking, cancelType: string): Promise<boolean> {
    const current = this.connection + '/cancel?cancel_type=' + cancelType;
    return this.http.post(current, { booking: booking }, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
            if (response.status == 200) {
              let sender = booking.hostUser;
              let rec = booking.performerUser;
              if (cancelType == "artist_cancel") {
                sender = booking.performerUser;
                rec = booking.hostUser;
              }
              let message = sender.firstName + " " + sender.lastName + " has paid you $" + booking.currentPrice +   " for cancelling " + booking.eventEID.eventName;
              let notification = new Notification(sender, rec, booking.eventEID._id,
                booking, null, message, "payment", ['/events', booking.eventEID._id]);
              this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
              return true;
            } else {
              return false;
            }
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