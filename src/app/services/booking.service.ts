// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Booking } from 'app/models/booking';
import { Event } from 'app/models/event';


@Injectable()
export class BookingService {
    public connection: string = 'http://localhost:8080/api/bookings';
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
                console.log(data)
                console.log(booking)
                return booking
            })
            .catch(this.handleError);
    }

    public getBooking(event: Event): Promise<Booking> {
        const current = this.connection + '/' + event._id

        return this.http.get(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const booking = data.booking as Booking;
                console.log(data)
                console.log(booking)
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