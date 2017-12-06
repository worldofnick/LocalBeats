// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { Event } from 'app/models/event';

@Injectable()
export class EventService {
    // public connection: string = 'http://localhost:8080/api/events';
    // public listConnection:string = 'http://localhost:8080/api/userEvents';
    public connection: string = 'https://localbeats.herokuapp.com/api/events';
    public listConnection:string = 'https://localbeats.herokuapp.com/api/userEvents';
    public accessToken: string = null;
    public user: User = null;
    public event: Event = null;
    public events:Event[] = null;

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor (private http: Http) {}

    // post("/api/events/create")
    public createEvent(newEvent:Event): Promise<Event> {
        const current = this.connection + '/create';
        console.log(current);
        console.log("event being created: ");
        console.log(newEvent);
        return this.http.post(current, {event : newEvent}, {headers: this.headers} )
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.access_token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken}))
                this.event = data.event as Event;
                console.log("printing event returned after creation");
                console.log(this.event);
                return this.event
            })
            .catch(this.handleError);
    }


      ///userEvents/?uid=asdf&limit=10&skip=10
      //api/userEvents/?hostUID=5a1caf147f9c707f00ce1e36
      public getEventsByUID(host:User): Promise<Event[]> {
        const current = this.listConnection + '/?hostUID='+host._id;
        console.log(current);
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.accessToken = data.access_token;
                sessionStorage.setItem('token', JSON.stringify({ accessToken: this.accessToken}))
                this.events = data.event as Event[];
                console.log("printing events returned after getting");
                console.log(response.json());
                return this.events
            })
            .catch(this.handleError);
    }


        // post("/api/events/eid")
        public getEventByEID(eventGotten:Event): Promise<Event> {
            const current = this.connection + eventGotten._id;
            console.log(current);
            return this.http.post(current, {event : eventGotten}, {headers: this.headers} )
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