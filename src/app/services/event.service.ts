// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { Event } from 'app/models/event';

@Injectable()
export class EventService {
    public connection: string = 'http://localhost:8080/api/events';
    // public connection: string = 'https://localbeats.herokuapp.com/api/auth';
    // public userConnection: string = 'https://localbeats.herokuapp.com/api/users';
    public accessToken: string = null;
    public user: User = null;
    public event: Event = null;

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor (private http: Http) {}

    // post("/api/user")
    public createEvent(newEvent:Event): Promise<Event> {
        const current = this.connection + '/create';
        console.log(current);
        return this.http.post(current, newEvent, {headers: this.headers} )
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.access_token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken}))
                this.event = data.event as Event;
                return this.event
            })
            .catch(this.handleError);
    }


    public isAuthenticated() {
        return this.accessToken != null;
    }

    private handleError (error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}