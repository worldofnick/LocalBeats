import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SearchTerms } from 'app/models/search';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { Notification } from 'app/models/notification';
import * as socketIO from 'socket.io-client';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class NotificationService {
    public connection: string = 'http://localhost:8080/api/notifications';

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    current: Notification
    notifications: Notification[];

    // Our socket connection
    // socket:any;
    io = socketIO('http://localhost:8080');
    id:any;

    constructor(private http: Http) { }

    connect(){
        // const io = socketIO('http://localhost:8080');
        // this.io.on('fromServer', msg=>console.log(msg));
        
    }

    sendToServer(){
       
    }


    public getNotificationsCountForUser(id: any): Promise<Number>{

        // const io = socketIO('http://localhost:8080');
        this.io.emit('notificationsCount', id);

        

        return new Promise((resolve, reject) => {
            this.io.on('fromServer', numberNotifs=>{
                console.log("returning number of notifs from notifcation service")
                console.log(numberNotifs);
                // if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(numberNotifs)
                // } else {
                //     reject(result.error);
                // }
            });
        })
        
    }

    public getNotificationsForUser(user: User): Promise<any[]> {

        let params: URLSearchParams = new URLSearchParams();
        params.set('id', user._id)

        return this.http.get(this.connection, { headers: this.headers, search: params })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const notificationsList = data.notifications as any[];
                return notificationsList
            })
            .catch(this.handleError);
    }


    public sendNotificationToUser(notification: Notification): Promise<any> {

        let params: URLSearchParams = new URLSearchParams();
        params.set('uid', notification.receiver._id)

        console.log(notification)
        return this.http.post(this.connection, { notification: Notification }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const statusNumber = data;
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
