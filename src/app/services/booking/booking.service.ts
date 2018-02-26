// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Booking, NegotiationResponses } from 'app/models/booking';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { PaymentStatus } from 'app/models/payment';
import { NegotiateDialogComponent } from '../../views/negotiate/negotiate-dialog/negotiate-dialog.component';
import { environment } from '../../../environments/environment';

@Injectable()
export class BookingService {
    public connection: string = environment.apiURL + 'api/bookings';
    public eventBooking: string = environment.apiURL + 'api/eventBooking/'
    public userBooking: string = environment.apiURL + 'api/userBookings/'
    public acceptBookingConnection: string = environment.apiURL + 'api/acceptBooking'
    public declineBookingConnection: string = environment.apiURL + 'api/declineBooking'
    public paymentBookingConnection: string = environment.apiURL + 'api/payments/bookingPaymentStatus'

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http, private dialog: MatDialog) { }

    public negotiate(booking: Booking, initial: boolean, view: string): Observable<{response: NegotiationResponses, price: number}> {
        let dialogRef: MatDialogRef<NegotiateDialogComponent>;
        dialogRef = this.dialog.open(NegotiateDialogComponent, {
            width: '380px',
            disableClose: false,
            data: {booking, initial, view}
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

    public acceptBooking(booking: Booking): Promise<any> {
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

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}