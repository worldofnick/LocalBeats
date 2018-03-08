import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user';
import { Review } from '../../models/review';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Message } from './model/message';
import { SocketEvent } from './model/event';
import { Action } from './model/action';
import { SocketNotification } from './model/socketNotification';
import { environment } from '../../../environments/environment';

import * as io from 'socket.io-client';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

const SERVER_URL = environment.apiURL; //TODO: or env.url + port (heroku)
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class SocketService {

  public socket;
  constructor( private http: HttpClient) { }

  // ==============================================
  // SHARED HELPER METHODS
  // ==============================================

  public initSocket(): void {
    this.socket = io(SERVER_URL);
  }

  // default event name: message
  public send(eventName: string, message: Message): void {
    this.socket.emit(eventName, message);
  }

  public sendToProfile(eventName: string, user: User): void {
    this.socket.emit(eventName, user);
  }

  public addedReview(eventName: string, review: Review): void {
    this.socket.emit(eventName, review);
  }

  public sendNotification(eventName: SocketEvent, notificationPayload: SocketNotification):void {
    //save notification to db.
    let body = JSON.stringify(notificationPayload);
    this.http.post(SERVER_URL + 'api/notification/', body, httpOptions);
    
    this.socket.emit(eventName, notificationPayload);
  }

  public onEvent(event: SocketEvent): Observable<any> {
    return new Observable<SocketEvent>(observer => {
        this.socket.on(event, (data) => observer.next(data));
    });
  }
}


