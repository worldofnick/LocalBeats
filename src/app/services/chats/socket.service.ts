import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user';
import { Message } from './model/message';
import { SocketEvent } from './model/event';
import { Action } from './model/action';
import { SocketNotification } from './model/socketNotification';

import * as io from 'socket.io-client';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

const SERVER_URL = 'http://localhost:8080'; //TODO: or env.url + port (heroku)

@Injectable()
export class SocketService {

  public socket;
  constructor() { }

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

  public sendNotification(eventName: SocketEvent, notificationPayload: SocketNotification): void {
    console.log("emitting a send notification event for :")
    console.log(notificationPayload);
    this.socket.emit(eventName, notificationPayload);
  }


  // public onMessage(): Observable<Message> {
  //   return new Observable<Message>(observer => {
  //       this.socket.on('message', (data: Message) => observer.next(data));
  //   });
  // }

  public onEvent(event: SocketEvent): Observable<any> {
    return new Observable<SocketEvent>(observer => {
        this.socket.on(event, (data) => observer.next(data));
    });
  }
}


