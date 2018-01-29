import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import { User } from '../../models/user';
import { ChatContactListUser } from '../../models/chatContactListUser';

import { UserService } from '../../services/auth/user.service';

@Injectable()
export class ChatsService {

  private url = 'http://localhost:8080';
  private socket = io(this.url);
  private loggedInUser: User = new User();

  constructor(private _userService: UserService) { }

  getConnectionUsers() {
    let users: ChatContactListUser[] = new Array();
    let user1 = new ChatContactListUser();
    let user2 = new ChatContactListUser();
    let user3 = new ChatContactListUser();

    this._userService.getUserByID('5a6f136cd9847106668772c1').then((gottenUser: User) => {
      user1.name = gottenUser.firstName + ' ' + gottenUser.lastName;
      user1.photo = gottenUser.profilePicUrl;
      user1.isOnline = true;  // TODO: gottenUser.isOnline
      user1.lastMsg = 'Catch em all!';
      users.push(user1);
    });
    this._userService.getUserByID('5a6f1348d9847106668772c0').then((gottenUser: User) => {
      user2.name = gottenUser.firstName + ' ' + gottenUser.lastName;
      user2.photo = gottenUser.profilePicUrl;
      user2.isOnline = true;  // TODO: gottenUser.isOnline
      user2.lastMsg = 'Catch em all!';
      users.push(user2);
    });
    this._userService.getUserByID('5a6cf410a502610f0771a16c').then((gottenUser: User) => {
      user3.name = gottenUser.firstName + ' ' + gottenUser.lastName;
      user3.photo = gottenUser.profilePicUrl;
      user3.isOnline = true;  // TODO: gottenUser.isOnline
      user3.lastMsg = 'Catch em all!';
      users.push(user3);
    });

    console.log('Users:', users);
    return users;
    //TODO: can just update the user model to have these fields
    // 
    // return [{
    //   name: 'Gevorg Spartak',
    //   photo: 'assets/images/face-2.jpg',
    //   isOnline: true,
    //   lastMsg: 'What\'s going!'
    // }, {
    //   name: 'Petros Toros',
    //   photo: 'assets/images/face-4.jpg',
    //   isOnline: true,
    //   lastMsg: 'Send me the stories.'
    // }, {
    //   name: 'Henrik Gevorg',
    //   photo: 'assets/images/face-5.jpg',
    //   isOnline: false,
    //   lastMsg: 'Great work!!'
    // }, {
    //   name: 'Gevorg Spartak',
    //   photo: 'assets/images/face-6.jpg',
    //   isOnline: false,
    //   lastMsg: 'Bye'
    // }, {
    //   name: 'Petros Toros',
    //   photo: 'assets/images/face-7.jpg',
    //   isOnline: true,
    //   lastMsg: 'We\'ll talk later'
    // }];
  }

  getCurrentLoggedInUser() {
    this.loggedInUser = this._userService.user;
    return this.loggedInUser;
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
