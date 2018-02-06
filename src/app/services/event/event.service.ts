// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'app/models/user';
import { Event } from 'app/models/event';


@Injectable()
export class EventService {
    public connection: string = 'http://localhost:8080/api/events';
    public listConnection:string = 'http://localhost:8080/api/userEvents';
    // public connection: string = 'https://localbeats.herokuapp.com/api/events';
    // public listConnection: string = 'https://localbeats.herokuapp.com/api/userEvents';
    public accessToken: string = null;
    public user: User = null;
    public event: Event = null;
    // public events: Event[] = null;
    public statusNumber:Number = null;

    public serverResponse:Response = null;
    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    // post("/api/events/create")
    public createEvent(newEvent: Event): Promise<Event> {
        const current = this.connection + '/create';
        return this.http.post(current, { event: newEvent }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.event = data.event as Event;
                return this.event
            })
            .catch(this.handleError);
    }


        // post("/api/events/create")
        public updateEvent(newEvent: Event): Promise<Event> {
            const current = this.connection + '/' + newEvent._id;
            return this.http.put(current, { event: newEvent }, { headers: this.headers })
                .toPromise()
                .then((response: Response) => {
                    const data = response.json();
                    this.event = data.event as Event;
                    return this.event
                })
                .catch(this.handleError);
        }


    /**
     * 
     * @param host 
     * 
     * GET EVENTS LIST BY HOST UID
     */
    ///userEvents/?uid=asdf&limit=10&skip=10
    //api/userEvents/?hostUID=5a1caf147f9c707f00ce1e36
    public getEventsByUID(UID: String): Promise<Event[]> {
        // const num = UID["id"];
        const current = this.listConnection + '/?hostUID=' + UID;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                let events:Event[];
                events = data.events as Event[];
                return events
            })
            .catch(this.handleError);
    }


    /**
     * 
     * @param EID 
     * 
     * GET EVENT BY EID
     */
    // post("/api/events/eid")
    public getEventByEID(EID: Object): Promise<Event> {
        const num = EID["id"];
        const current = this.connection + '/' + num;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                this.event = data.event as Event;
                return this.event
            })
            .catch(this.handleError);
    }



    /**
     * 
     * @param eventToDelete 
     * 
     * DELETE DELETE DELETE DELETE DELETE
     */
    // post("/api/events/eid")
    public deleteEventByEID(eventToDelete: Event): Promise<Number> {
        const current = this.connection + '/' + eventToDelete._id;
        return this.http.delete(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.status;
                this.statusNumber = data;
                return this.statusNumber;
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