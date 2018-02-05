import { Component, OnInit } from '@angular/core';
import { SocketService } from 'app/services/chats/socket.service';
import { SocketEvent } from 'app/services/chats/model/event';
import { Message } from 'app/services/chats/model/message';
import { MatSnackBar } from '@angular/material';
import { UserService } from 'app/services/auth/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  artists = [{
    name: 'Featured Drummer',
    url: 'assets/images/drums-image.png'
  }, {
    name: 'Featured Trumpet',
    url: 'assets/images/trumpet-pic.png'
  }, {
    name: 'Featured Guitarist',
    url: 'assets/images/guitar-pic.jpg'
  }]

  events = [{
    name: 'Featured Restaurant',
    url: 'assets/images/coffee-shop-pic.jpg'
  }, {
    name: 'Featured Concert',
    url: 'assets/images/concert-pic.jpeg'
  }, {
    name: 'Featured Wedding',
    url: 'assets/images/wedding-pic.jpg'
  }]
  constructor(private _userService: UserService, public snackBar: MatSnackBar, private _socketService: SocketService) { 
    
  }

  ngOnInit() {
    this.initIoConnection();            // Listen for any private messages
  }

  openNewMessageSnackBar(message: Message) {
    if (this._userService.user._id !== message.from._id) {
      this.snackBar.open('You have a new message from ' + message.from.firstName + ' ' + message.from.lastName,
                        'close', { duration: 3500 });
    };
  }

  initIoConnection() {
    this._socketService.onEvent(SocketEvent.SEND_PRIVATE_MSG)
      .subscribe((message: Message) => {
        console.log('PM from server (main app module): ', message);
        const temp: Message = message as Message;
        this.openNewMessageSnackBar(temp);
    });
  }

}
