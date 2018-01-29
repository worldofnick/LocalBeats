import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class ChatsService {

  private url = 'http://localhost:8080';
  private socket = io(this.url);

  constructor() { }

  getConnectionUsers() {
    return [{
      name: 'Gevorg Spartak',
      photo: 'assets/images/face-2.jpg',
      isOnline: true,
      lastMsg: 'What\'s going!'
    }, {
      name: 'Petros Toros',
      photo: 'assets/images/face-4.jpg',
      isOnline: true,
      lastMsg: 'Send me the stories.'
    }, {
      name: 'Henrik Gevorg',
      photo: 'assets/images/face-5.jpg',
      isOnline: false,
      lastMsg: 'Great work!!'
    }, {
      name: 'Gevorg Spartak',
      photo: 'assets/images/face-6.jpg',
      isOnline: false,
      lastMsg: 'Bye'
    }, {
      name: 'Petros Toros',
      photo: 'assets/images/face-7.jpg',
      isOnline: true,
      lastMsg: 'We\'ll talk later'
    }];
  }

  // TODO: add method join / switch user. Should send JoinPM with sender user and receiever user. Socekt can join 
  // on those rooms on the server-side

  sendMessage(message) {
    // TODO: send message and the name of the user who sent and receieved
    this.socket.emit('chat-message-sent', message);
  }

  getServerMsgAcknowledge() {
    let observable = new Observable( observer => {
      this.socket.on('acknowledge-chat-message', (message) => {
        observer.next(message);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }
}
