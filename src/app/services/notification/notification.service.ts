import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { SearchTerms } from 'app/models/search';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { Notification } from 'app/models/notification';
// import * as socketIO from 'socket.io-client';
import * as Rx from 'rxjs/Rx';

const SERVER_URL = 'http://localhost:8080';
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

@Injectable()
export class NotificationService {
    public connection: string = 'http://localhost:8080/api/notifications';

    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

    current: Notification
    notifications: Notification[] = [];

    // Our socket connection
    // private socket:socketIO.socket;

    constructor(private http: Http, private httpClient: HttpClient) { 


    }

    saveNotificationToDB(notification: Notification) {
        let body = JSON.stringify(notification);
        return this.httpClient.put(SERVER_URL + '/api/notifications/', body, httpOptions);
    }

    connect(){
        // const io = socketIO('http://localhost:8080');
        // io.on('fromServer', msg=>console.log(msg));
    }

    sendToServer(){
        // const io = socketIO('http://localhost:8080');
        // io.on('connection', socket=>{
        //     console.log
        // })
    }


    // public getNotificationsCountForUser(ID: any): Promise<Number>{
    //     let userConnection: string = 'http://localhost:8080/api/users';
    //     const current = userConnection + '/' + ID;
    //     //console.log("getting: ");
    //     //console.log(current);
    //     return this.http.get(current)
    //         .toPromise()
    //         .then((response: Response) => {
    //             const data = response.json();
    //             // this.accessToken = data.token;
    //             // console.log(this.accessToken)
    //             let temp = data.user as User;
    //             let not1:Notification = new Notification;
    //             not1.icon = "home"
    //             not1.message = "hello world"
    //             temp.notifications.push(not1);
    //             temp.notifications.push(not1);

    //             this.io.emit('tellTopBar', temp.notifications.length)
    //             return temp.notifications.length;
    //         })
    //         .catch(this.handleError);
    // }


    // public getNotificationsForUser(ID: any): Promise<Notification[]>{
    //     let userConnection: string = 'http://localhost:8080/api/users';
    //     const current = userConnection + '/' + ID;
    //     //console.log("getting: ");
    //     //console.log(current);
    //     return this.http.get(current)
    //         .toPromise()
    //         .then((response: Response) => {
    //             const data = response.json();
    //             // this.accessToken = data.token;
    //             // console.log(this.accessToken)
    //             let temp = data.user as User;
    //             let not1:Notification = new Notification;
    //             not1.icon = "chat"
    //             not1.message = "helloo world"
    //             temp.notifications.push(not1);
    //             temp.notifications.push(not1);

    //             this.io.emit('tellNotificationPanel', temp.notifications)
    //             return temp.notifications;
    //         })
    //         .catch(this.handleError);
    // }


    // public getUserByID(ID: String): Promise<User> {
    //     let userConnection: string = 'http://localhost:8080/api/users';

    //     const current = userConnection + '/' + ID;
    //     return this.http.get(current)
    //         .toPromise()
    //         .then((response: Response) => {
    //             const data = response.json();
    //             // this.accessToken = data.token;
    //             // console.log(this.accessToken)
    //             let temp = data.user as User;
    //             return temp
    //         })
    //         .catch(this.handleError);
    // }

    // public sendNotificationToUser(notification: any): Promise<any> {


    //     this.getUserByID(notification.receiverID).then((receiver:User) =>{

    //     //update the receiving user object w/ an additional notification in the list.
    //     let userConnection: string = 'http://localhost:8080/api/users';
    //     const current = userConnection + '/' + receiver._id;        
    //     receiver.notifications.push(notification);
    //     receiver.notifications.push(notification);
    //     receiver.notifications.push(notification);

    //     console.log(receiver.notifications);
    //     console.log(receiver);

    //     return this.http.put(current, { user: receiver }, { headers: this.headers })
    //         .toPromise()
    //         .then((response: Response) => {
    //             const data = response.json();
    //             // this.user = data.user as User;
    //             return data.user as User;
    //             // return
    //         })
    //         .catch(this.handleError); 
    //     })

    //     return;

    // }

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}
