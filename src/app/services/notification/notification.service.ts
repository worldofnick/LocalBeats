import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { SearchTerms } from 'app/models/search';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { Notification } from 'app/models/notification';
import { environment } from '../../../environments/environment';
// import * as socketIO from 'socket.io-client';
import * as Rx from 'rxjs/Rx';

const SERVER_URL = environment.apiURL;
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

@Injectable()
export class NotificationService {
    public connection: string = environment.apiURL + 'api/notifications';

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    current: Notification
    notifications: Notification[] = [];


    constructor(private http: Http, private httpClient: HttpClient) { 


    }

    saveNotificationToDB(notification: Notification) {
        let body = JSON.stringify(notification);
        return this.httpClient.put(SERVER_URL + 'api/notifications/', body, httpOptions);
    }

    connect(){

    }

    public deleteNotificationById(notificationID: string): Promise<Number> {

        const current = SERVER_URL + 'api/notification/' + notificationID;
        return this.http.delete(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.status;
                let statusNumber = data;
                return statusNumber;
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
