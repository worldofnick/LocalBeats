// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Booking, NegotiationResponses, VerificationResponse } from 'app/models/booking';
import { Event } from 'app/models/event';
import { Review } from 'app/models/review';
import { Notification } from 'app/models/notification';
import { User } from 'app/models/user';
import { PaymentStatus } from 'app/models/payment';
import { NegotiateDialogComponent } from '../../views/negotiate/negotiate-dialog/negotiate-dialog.component';
import { VerifyDialogComponent } from '../../views/negotiate/verify-dialog/verify-dialog.component';
import { environment } from '../../../environments/environment';
import { SocketService } from 'app/services/chats/socket.service';
import { SocketEvent } from 'app/services/chats/model/event';


@Injectable()
export class BookingService {
    public connection: string = environment.apiURL + 'api/bookings';
    public eventBooking: string = environment.apiURL + 'api/eventBooking/'
    public userBooking: string = environment.apiURL + 'api/userBookings/'
    public acceptBookingConnection: string = environment.apiURL + 'api/acceptBooking'
    public declineBookingConnection: string = environment.apiURL + 'api/declineBooking'
    public paymentBookingConnection: string = environment.apiURL + 'api/payments/bookingPaymentStatus'

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http, private dialog: MatDialog, private socketService: SocketService) { }

    public negotiate(booking: Booking, initial: boolean): Observable<{ response: NegotiationResponses, price: number }> {
        let dialogRef: MatDialogRef<NegotiateDialogComponent>;
        dialogRef = this.dialog.open(NegotiateDialogComponent, {
            width: '380px',
            disableClose: false,
            data: { booking, initial }
        });
        return dialogRef.afterClosed();
    }

    public verify(booking: Booking, isHost: boolean): Observable<{ response: VerificationResponse, comment: string }> {
        let dialogRef: MatDialogRef<VerifyDialogComponent>;
        dialogRef = this.dialog.open(VerifyDialogComponent, {
            width: '380px',
            disableClose: false,
            data: { booking, isHost }
        });
        return dialogRef.afterClosed();
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
        const current = this.eventBooking + '?eid=' + event._id;

        return this.http.get(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const bookings = data.bookings as any[];
                return bookings
            })
            .catch(this.handleError);
    }

    public sendNotificationsToBoth(review: Review) {
        console.log('review received', review);

        if (review.booking.bothReviewed) {
            // send notification to artist and host
            const profile: string[] = ['/profile'];

            const notificationToArtist = new Notification(review.fromUser, review.toUser,
                review.booking.eventEID._id, review.booking, NegotiationResponses.review,
                'You have been reviewed by ' + review.fromUser.firstName + ' and now your review is published', 'rate_review', profile);

            const notificationToHost = new Notification(review.toUser, review.fromUser,
                review.booking.eventEID._id, review.booking, NegotiationResponses.review,
                'You have been reviewed by ' + review.toUser.firstName + ' and now your review is published', 'rate_review', profile);

            console.log('sending reviews notif to both');
            this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToArtist);
            this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToHost);
        }
    }

    public sendNotificationsToArtist(review: Review) {
        console.log('review received', review);
        // send notification to artist
        const profile: string[] = ['/profile', 'performances'];

        const notificationToArtist = new Notification(review.fromUser, review.toUser,
            review.booking.eventEID._id, review.booking, NegotiationResponses.review,
            'You have been reviewed by ' + review.fromUser.firstName + ' click here to leave your review', 'hearing', profile);
        console.log('notificaiton created ', notificationToArtist);

        this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToArtist);

    }

    public sendNotificationsToHost(review: Review) {
        console.log('review received', review);


        // send notification to artist
        // this path should be changed with the new managment UI most likely
        const profile: string[] = ['/profile', 'events'];

        const notificationToHost = new Notification(review.fromUser, review.toUser,
            review.booking.eventEID._id, review.booking, NegotiationResponses.review,
            'You have been reviewed by ' + review.fromUser.firstName + ' click here to leave your review', 'hearing', profile);

        console.log('notificaiton created ', notificationToHost);

        this.socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notificationToHost);

    }
    public getUserBookings(user: User, type: string): Promise<any[]> {
        const current = this.userBooking

        let params: URLSearchParams = new URLSearchParams();
        params.set('uid', user._id)
        params.set('user_type', type)

        return this.http.get(current, { headers: this.headers, search: params })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const bookings = data.bookings as any[];
                return bookings
            })
            .catch(this.handleError);
    }

    public updateBooking(newBooking: Booking) {
        const current = this.connection + '/' + newBooking._id;
        return this.http.put(current, { booking: newBooking }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const booking = data.booking as Booking;
                return booking
            })
            .catch(this.handleError);
    }

    public declineBooking(booking: Booking) {
        const current = this.declineBookingConnection + '/' + booking._id;

        return this.http.put(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
            })
            .catch(this.handleError);
    }

    public acceptBooking(booking: Booking): Promise<any> {
        const current = this.acceptBookingConnection + '/' + booking._id;

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

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}