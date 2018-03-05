// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Booking, NegotiationResponses, VerificationResponse, BookingType } from 'app/models/booking';
import { Event } from 'app/models/event';
import { Review } from 'app/models/review';
import { Notification } from 'app/models/notification';
import { User } from 'app/models/user';
import { PaymentStatus } from 'app/models/payment';
import { NegotiateDialogComponent } from '../../views/negotiate/negotiate-dialog/negotiate-dialog.component';
import { StripeDialogComponent } from '../../views/events/event-singleton/stripe-dialog.component';
import { VerifyDialogComponent } from '../../views/negotiate/verify-dialog/verify-dialog.component';
import { environment } from '../../../environments/environment';
import { SocketService } from 'app/services/chats/socket.service';
import { SocketEvent } from 'app/services/chats/model/event';
import { EventService } from 'app/services/event/event.service';
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

@Injectable()
export class BookingService {
    public connection: string = environment.apiURL + 'api/bookings';
    public eventBooking: string = environment.apiURL + 'api/eventBooking/'
    public userBooking: string = environment.apiURL + 'api/userBookings/'
    public acceptBookingConnection: string = environment.apiURL + 'api/acceptBooking'
    public declineBookingConnection: string = environment.apiURL + 'api/declineBooking'
    public paymentBookingConnection: string = environment.apiURL + 'api/payments/bookingPaymentStatus'

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http, private dialog: MatDialog, private socketService: SocketService, private eventService: EventService) { }

    public negotiate(booking: Booking, initial: boolean, view: string, artistAvail: string): Observable<{response: NegotiationResponses, price: number, comment: string}> {
        if ((view == "artist" && !booking.performerUser.stripeAccountId || view == "host" && !booking.hostUser.stripeAccountId)) {
            return this.showStripeDialog().afterClosed();
        }
        let dialogRef: MatDialogRef<NegotiateDialogComponent>;
            dialogRef = this.dialog.open(NegotiateDialogComponent, {
                width: '380px',
                disableClose: false,
                data: {booking, initial, view, artistAvail}
            });
            return dialogRef.afterClosed();
    }


    private showStripeDialog(): MatDialogRef<StripeDialogComponent> {
        let dialogRef: MatDialogRef<StripeDialogComponent>;
        dialogRef = this.dialog.open(StripeDialogComponent, {
            width: '250px',
            disableClose: false,
            data: { }
        });
        return dialogRef;
    }
  
    public verify(booking: Booking, isHost: boolean): Observable<{response: VerificationResponse, comment: string}> {
        let dialogRef: MatDialogRef<VerifyDialogComponent>;
        dialogRef = this.dialog.open(VerifyDialogComponent, {
            width: '380px',
            disableClose: false,
            data: {booking, isHost}
        });
        return dialogRef.afterClosed();
    }

    public sendNotificationsToBoth(review: Review) {
        if (review.booking.bothReviewed) {
            // send notification to artist and host
            const profile: string[] = ['/profile'];

            const notificationToArtist = new Notification(null, review.fromUser, review.toUser,
                review.booking.eventEID._id, review.booking, NegotiationResponses.review,
                'You have been reviewed by ' + review.fromUser.firstName + ' and now your review is published', 'rate_review', new Date(), profile);

            const notificationToHost = new Notification(null, review.toUser, review.fromUser,
                review.booking.eventEID._id, review.booking, NegotiationResponses.review,
                'You have been reviewed by ' + review.toUser.firstName + ' and now your review is published', 'rate_review', new Date(), profile);

            this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToArtist);
            this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToHost);
        }
    }

    public sendNotificationsToArtist(review: Review) {
        // send notification to artist
        const profile: string[] = ['/profile', 'performances'];

        const notificationToArtist = new Notification(null, review.fromUser, review.toUser,
            review.booking.eventEID._id, review.booking, NegotiationResponses.review,
            'You have been reviewed by ' + review.fromUser.firstName + ' click here to leave your review', 'hearing', new Date(), profile);

        this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToArtist);

    }

    public sendNotificationsToHost(review: Review) {
        // send notification to artist
        // this path should be changed with the new managment UI most likely
        const profile: string[] = ['/profile', 'events'];

        const notificationToHost = new Notification(null, review.fromUser, review.toUser,
            review.booking.eventEID._id, review.booking, NegotiationResponses.review,
            'You have been reviewed by ' + review.fromUser.firstName + ' click here to leave your review', 'hearing', new Date(), profile);

        this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToHost);

    }

    // post("/api/events/create")
    public createBooking(newBooking: Booking): Promise<Booking> {
        const current = this.connection + '/create';
        return this.http.post(current, { booking: newBooking }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const booking = data.booking as Booking;
                return booking
            })
            .catch(this.handleError);
    }

    public getBooking(event: Event): Promise<any[]> {
        const current = this.eventBooking + '?eid=' +event._id;

        return this.http.get(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const bookings = data.bookings as any[];
                return bookings
            })
            .catch(this.handleError);
    }

    public getUserBookings(user: User, type: string): Promise<any[]> {
        const current = this.userBooking

        let params: URLSearchParams = new URLSearchParams();
        params.set('uid', user._id)
        params.set('user_type', type)
        
        return this.http.get(current, { headers: this.headers, search: params  })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const bookings = data.bookings as any[];
                return bookings
            })
            .catch(this.handleError);
    }

    public updateBooking(newBooking: Booking) {
        const current = this.connection + '/' + newBooking._id
        return this.http.put(current, {booking: newBooking}, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const booking = data.booking as Booking;
                return booking
            })
            .catch(this.handleError);
    }

    public declineBooking(booking: Booking) {
        const current = this.declineBookingConnection + '/' + booking._id

        return this.http.put(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
            })
            .catch(this.handleError);
    }

    public acceptBooking(booking: Booking, view: string): Promise<any> {
        if ((view == "artist" && !booking.performerUser.stripeAccountId || view == "host" && !booking.hostUser.stripeAccountId)) {
            return this.showStripeDialog().afterClosed().toPromise();
        }

        const current = this.acceptBookingConnection + '/' + booking._id
        
        return this.http.put(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const booking = data.booking as Booking;
                return booking
            })
            .catch(this.handleError);
    }

    public bookingPaymentStatus(booking: Booking): Promise<PaymentStatus> {
        const current = this.paymentBookingConnection + '/?bid=' + booking._id
        
        return this.http.get(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                return data["status"];
            })
            .catch(this.handleError);
    }

    public getArtistAvailability(booking: Booking): Promise<string>{
        let artistEvents = [];
        return this.eventService.getEventsByUID(booking.performerUser._id).then( (eventList: Event[]) => {
          for(let e of eventList){
            artistEvents.push(e);
          }
          return this.getUserBookings(booking.performerUser, 'artist').then( (bookings: Booking[]) =>{
            for(let b of bookings){
              if(b.approved){
                artistEvents.push(b.eventEID);
              }
            }
            for (let e of artistEvents) {
              if (isWithinRange(booking.eventEID.fromDate, e.fromDate, addMinutes(e.toDate, 5)) ||
                  isWithinRange(booking.eventEID.toDate, e.fromDate, addMinutes(e.toDate, 5))) {
                if(booking.bookingType == BookingType.hostRequest){
                  return 'Artist is currently not available for this event. You may still request the artist but confirm availability before booking this event.';
                }else{
                  return 'You are currently not available for this event. You may still apply, but confirm your availbility for this event before completing the booking process.'
                }
              }
            }
            return "";
          });
        });
      }

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}