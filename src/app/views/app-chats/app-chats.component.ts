import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Rx';
import { ChatsService } from 'app/services/chats/chats.service';
import { SocketService } from 'app/services/chats/socket.service';
import { User } from '../../models/user';
import { Message } from '../../services/chats/model/message';
import { Event } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';

@Component({
  selector: 'app-chats',
  templateUrl: './app-chats.component.html',
  styleUrls: ['./app-chats.component.css']
})
export class AppChatsComponent implements OnInit {
  
  // ==============================================
  // Material Variables
  // ==============================================
  isMobile;
  screenSizeWatcher: Subscription;
  isSidenavOpen: Boolean = true;
  @ViewChild(MatSidenav) private sideNave: MatSidenav;

  // ==============================================
  // Chat Variables
  // ==============================================
  action = Action;
  messages: Message[] = [];
  ioConnection: any;
  messageEntered: string;
  loggedInUser: User = new User();
  activeChatUser: User = new User();    //TODO: set to first user in connectedUsers list or one with highest unread count
  connectedUsers: User[] = new Array();

  // ==============================================
  // Methods
  // ==============================================

  constructor(private media: ObservableMedia, private _socketService: SocketService, private _chatsService: ChatsService) {
    this.loggedInUser = this._chatsService.getCurrentLoggedInUser();
    this.getAllUsers();
    console.log('Logged in User:', this._chatsService.getCurrentLoggedInUser());
  }

  ngOnInit() {
    this.initIoConnection();
    this.chatSideBarInit();
    // this.changeActiveUser(this.activeChatUser); // sed join message

    // let connection;
    // connection = this._chatsService.getServerOnlineStatusOpdateMessage().subscribe(message => {
    //   console.log('Status message from server : ', message);
    // });
  }

  private initIoConnection(): void {
    this._socketService.initSocket();

    this.ioConnection = this._socketService.onMessage()
      .subscribe((message: Message) => {
        this.messages.push(message);
        console.log('Server msg (to chat): ', message);
    });

    this._socketService.onEvent(Event.CONNECT)
      .subscribe((message: Message) => {
        console.log('Connected (chat event): ', message);
    });
    
    this._socketService.onEvent(Event.DISCONNECT)
      .subscribe((message: Message) => {
        console.log('Disconnected (chat event): ', message);
    });

    this._socketService.onEvent(Event.NEW_LOG_IN)
      .subscribe((message: Message) => {
        console.log('New user logged in (chat event): ', message);
    });

    this._socketService.onEvent(Event.SMN_LOGGED_OUT)
      .subscribe((message: Message) => {
        console.log('Some user logged out (chat event): ', message);
    });
  }

  // SUbscribe takes 3 event handlers:
  // onNext, onError, onCompleted
  getAllUsers() {
    this._chatsService.getConnectionUsers().subscribe(
      data => {
        console.log('User DATA: ', data);
        const temp = data as { users: User[] };
        console.log('Cast: ', temp.users);
        // TODO: add only if users not in connectedUsers
        this.connectedUsers.push(temp.users[3]);
        this.connectedUsers.push(temp.users[5]);
        this.connectedUsers.push(temp.users[6]);
        for (let i = 0; i < this.connectedUsers.length; i++) {
          console.log('Temp Connected:', this.connectedUsers[i]);
        }
        this.activeChatUser = this.connectedUsers[0];
      },
      err => console.error(err),
      () => console.log('Done loading users')
    );
  }

  changeActiveUser(user) {
    let connection;
    this.activeChatUser = user;
    console.log('New User clicked:', this.activeChatUser);
    // this._chatsService.sendPrivateJoinMessage(this.activeChatUser);

    // connection = this._chatsService.getServerJoinPrivateChatAcknowledge().subscribe(message => {
    //     console.log('Acknowledge message from server : ', message);
    //   });
  }

  updateSidenav() {
    let self = this;
    setTimeout(() => {
      self.isSidenavOpen = !self.isMobile;
      self.sideNave.mode = self.isMobile ? 'over' : 'side';
    });
  }

  chatSideBarInit() {
    this.isMobile = this.media.isActive('xs') || this.media.isActive('sm');
    this.updateSidenav();
    this.screenSizeWatcher = this.media.subscribe((change: MediaChange) => {
      this.isMobile = (change.mqAlias == 'xs') || (change.mqAlias == 'sm');
      this.updateSidenav();
    });
  }

  sendMessageClicked() {
    let connection;
    console.log('---------------------');
    console.log('User entered the message: ', this.messageEntered);
    console.log('Sender: ', this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName);
    console.log('Receiver: ', this.activeChatUser.firstName + ' ' + this.activeChatUser.lastName);
    console.log('---------------------');

    // If the user entered non-blank message and hit send, communicate with server
    // if (this.messageEntered.trim().length > 0) {
    //   this._chatsService.sendMessage(this.messageEntered);
    //   this.messageEntered = '';

    //   connection = this._chatsService.getServerMsgAcknowledge().subscribe(message => {
    //     console.log('Acknowledge message from server : ', message);
    //   });
    // }
  }
}
