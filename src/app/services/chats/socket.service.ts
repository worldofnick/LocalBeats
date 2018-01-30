import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
// import { HttpClient, HttpHeaders } from '@angular/common/http';

import { UserService } from '../../services/auth/user.service';
import { User } from '../../models/user';
import { Message } from './model/Message';
import { Event } from './model/event';

import * as io from 'socket.io-client';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class SocketService {

  private socket;
  
  constructor(private _userService: UserService) { }

  // ==============================================
  // SHARED HELPER METHODS
  // ==============================================

  public initSocket(): void {
    this.socket = io(SERVER_URL);
  }

  public send(message: Message): void {
    this.socket.emit('message', message);
  }

  public onMessage(): Observable<Message> {
    return new Observable<Message>(observer => {
        this.socket.on('message', (data: Message) => observer.next(data));
    });
  }

  public onEvent(event: Event): Observable<any> {
    return new Observable<Event>(observer => {
        this.socket.on(event, (data) => observer.next(data));
    });
  }
}
