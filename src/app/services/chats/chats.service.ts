import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { UserService } from '../../services/auth/user.service';
import { User } from '../../models/user';
import { Message } from './model/Message';
import { Event } from './model/event';
import { SocketService} from './socket.service';

import * as io from 'socket.io-client';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class ChatsService {

  private socket;
  private loggedInUser: User = new User();

  constructor(private _userService: UserService, private _socketService: SocketService, private http: HttpClient) { }

  // // ==============================================
  // // SHARED HELPER METHODS
  // // ==============================================

  // public initSocket(): void {
  //   this.socket = io(SERVER_URL);
  // }

  // public send(message: Message): void {
  //   this.socket.emit('message', message);
  // }

  // public onMessage(): Observable<Message> {
  //   return new Observable<Message>(observer => {
  //       this.socket.on('message', (data: Message) => observer.next(data));
  //   });
  // }

  // public onEvent(event: Event): Observable<any> {
  //   return new Observable<Event>(observer => {
  //       this.socket.on(event, (data) => observer.next(data));
  //   });
  // }

  // ==============================================
  // COMPONENT HELPER METHODS
  // ==============================================
  getConnectionUsers() {
    return this.http.get(SERVER_URL + '/api/users/');
    
    //TODO: can just update the user model to have these fields
  }

  getCurrentLoggedInUser() {
    this.loggedInUser = this._userService.user;
    return this.loggedInUser;
  }

  // getServerOnlineStatusOpdateMessage() {
  //   let observable = new Observable( observer => {
  //     this.socket.on('refreshChatOnlineStatuses', (message) => {
  //       observer.next(message);
  //     });
  //     // return () => {
  //     //   this.socket.disconnect();
  //     // };
  //   });
  //   return observable;
  // }

  // TODO: add method join / switch user. Should send JoinPM with sender user and receiever user. Socekt can join 
  // on those rooms on the server-side

  // sendMessage(message) {
  //   // TODO: send message and the name of the user who sent and receieved
  //   this.socket.emit('chat-message-sent', message);
  // }

  // sendPrivateJoinMessage(receiverUser: User) {
  //   let messageRooms = {
  //     senderName      : this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName,
  //     receiverName    : receiverUser.firstName + ' ' + receiverUser.lastName,
  //     senderRoom      : this.loggedInUser.email,
  //     receiverRoom   : receiverUser.email
  //   };
  //   console.log('Message Rooms: ', messageRooms);
  //   this.socket.emit('joinChat', messageRooms);
  // }

  // getServerMsgAcknowledge() {
  //   let observable = new Observable( observer => {
  //     this.socket.on('acknowledge-chat-message', (message) => {
  //       observer.next(message);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   });
  //   return observable;
  // }

  // getServerJoinPrivateChatAcknowledge() {
  //   let observable = new Observable( observer => {
  //     this.socket.on('acknowledgeJoin', (message) => {
  //       observer.next(message);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   });
  //   return observable;
  // }
}
