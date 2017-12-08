// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Booking } from 'app/models/booking';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';


@Injectable()
export class BookingService {
    public connection: string = 'http://localhost:8080/api/bookings';
    public eventBooking: string = 'http://localhost:8080/api/eventBooking/'
    public userBooking: string = 'http://localhost:8080/api/userBookings/'
    public acceptBookingConnection: string = 'http://localhost:8080/api/acceptBooking'
    public declineBookingConnection: string = 'http://localhost:8080/api/declineBooking'
    // public connection: string = 'https://localbeats.herokuapp.com/api/bookings';

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

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

    public getUserBookings(user: User): Promise<any[]> {
        const current = this.userBooking

        let params: URLSearchParams = new URLSearchParams();
        params.set('uid', user._id)
        params.set('user_type', 'host')
        
        return this.http.get(current, { headers: this.headers, search: params  })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const bookings = data.bookings as any[];
                return bookings
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
                console.log(response)
                const data = response.json();
                const booking = data.booking as Booking;
                return booking
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