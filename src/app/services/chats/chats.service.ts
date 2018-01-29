import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class ChatsService {

  private url = 'http://localhost:8080';
  private socket = io(this.url);

  constructor() { }

  sendMessage(message) {
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
