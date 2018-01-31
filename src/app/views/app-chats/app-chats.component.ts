import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { MessageTypes } from '../../services/chats/model/messageTypes';

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
  activeChatMessages: Message[] = new Array();
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
    this.initChatSideBarWithWithNewUsers();
    console.log('Logged in User:', this._chatsService.getCurrentLoggedInUser());
  }

  ngOnInit() {
    this.initIoConnection();
    this.chatSideBarInit();
  }

  private initIoConnection(): void {
    this._socketService.initSocket();

    // TODO: add:
    // this._socketService.socket.on('connect', () => {
    //        listen to all events inside it
    //});

    // Every time there is a new login/out, it reloads the chat side Bar.
    this._socketService.onEvent(Event.NEW_LOG_IN)                       // TODO: optimize to reload only online status and new, deleted users
      .subscribe((message: Message) => {
        console.log('New user logged in (chat event): ', message);
        this.reloadChatSideBarWithNewConnectedUsers();                   // reload the connectedUsers navBar
    });

    this._socketService.onEvent(Event.SMN_LOGGED_OUT)
      .subscribe((message: Message) => {
        console.log('Some user logged out (chat event): ', message);
        this.reloadChatSideBarWithNewConnectedUsers();                   // reload the connectedUsers navBar
    });

    this._socketService.onEvent(Event.SEND_PRIVATE_MSG)
      .subscribe((message: Message) => {
        // Add response message[] to the activeChatMessages[]
        this.activeChatMessages = new Array();      // Reset the array
        for (let temp of message as Message[]) {
          this.activeChatMessages.push(temp as Message);
        };
        console.log('Private Chat message from server (chat event): ', message);
        // console.log('Active Chat Messages var (chat event): ', this.activeChatMessages);
        
        // TODO: refresh UI?
    });

    this._socketService.onEvent(Event.REQUEST_PM_SOCKET_ID)
      .subscribe((message: Message) => {
        console.log('Socket Request (chat event): ', message);
        console.log(' to == logged in? : ', (message.serverPayload.from._id === this.loggedInUser._id) ||
                                            (message.serverPayload.to._id === this.loggedInUser._id)) ;
        this.respondToIsItYouPMSocketRequest(message);
    });
  }

  respondToIsItYouPMSocketRequest(message) {
    if ( (message.serverPayload.from._id === this.loggedInUser._id) ||
        (message.serverPayload.to._id === this.loggedInUser._id)) {
      console.log('Sending socket: ', this._socketService.socket.id);
      this._socketService.send(Action.REQUEST_PM_SOCKET_ID, this._socketService.socket.id);
    }
  }

  // SUbscribe takes 3 event handlers:
  // onNext, onError, onCompleted
  reloadChatSideBarWithNewConnectedUsers() {
    this._chatsService.getConnectionUsers().subscribe(
      data => {
        // console.log('User DATA: ', data);
        const temp = data as { users: User[] };
        // console.log('Full response: ', temp.users);
        
        // Reset the users
        this.connectedUsers = new Array();    //TODO: expect the current chat ones (active user)?

        // TODO: add only if users not in connectedUsers
        this.connectedUsers.push(temp.users[3]);
        this.connectedUsers.push(temp.users[5]);
        this.connectedUsers.push(temp.users[6]);
        console.log('Side Bar Connected Users:', this.connectedUsers);
      },
      err => console.error(err),
      () => { 
        console.log('Done reloading users in chat side bar');
        // this.chatSideBarInit();
      }
    );
  }

  initChatSideBarWithWithNewUsers() {
    this._chatsService.getConnectionUsers().subscribe(
      data => {
        // console.log('User DATA: ', data);
        const temp = data as { users: User[] };
        // console.log('Full response: ', temp.users);

        this.connectedUsers.push(temp.users[3]);          // TODO: add only if users not in connectedUsers
        this.connectedUsers.push(temp.users[5]);
        this.connectedUsers.push(temp.users[6]);
        console.log('(Init) Side Bar Connected Users:', this.connectedUsers);
        this.activeChatUser = this.connectedUsers[0]; // TODO: change to whatever filter applied later
      },
      err => console.error(err),
      () => console.log('Done initializing users in chat side bar')
    );
  }

  changeActiveUser(user) {
    let connection;
    this.activeChatUser = user;
    console.log('New User clicked:', this.activeChatUser);

    // ALGORITHM:
    // retrieve getUserByID. 
        // if the receiverUser is online:
            // ask server to add to private chat room
        // else
            // REST api store messages to DB as unread for receiver user


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
    console.log('-------CHAT UI---------');
    console.log('%s entered the message: %s', this.loggedInUser.firstName, this.messageEntered);
    console.log('Sender: ', this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName);
    console.log('Receiver: ', this.activeChatUser.firstName + ' ' + this.activeChatUser.lastName);
    console.log('---------------------');

    /**
     * isRead?: boolean;
    sentAt?: Date;
    messageType?: string;
    attachmentURL?: string;
    serverMessage?: any;
    serverPayload?: any;
     */
    // If the user entered non-blank message and hit send, communicate with server

    if (this.messageEntered.trim().length > 0) {

      // CASE 1: Both users online. So do a socket event
      if (this.activeChatUser.isOnline) {
        let privateMessage: Message = this.createPMObject(true, MessageTypes.MSG);
        console.log("MSG JSON: ", JSON.stringify(privateMessage));
        this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
      }
      // CASE 2: The recipient is offline. So an HTTP request instead of socket event
      else {
        let privateMessage: Message = this.createPMObject(false, MessageTypes.MSG);

        // TODO: <<<<<< REPALCE WITH HTTP PUT/POST >>>>>>>>>>>
        this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
      }
      this.resetMessageInputBox();
    }
  }

  resetMessageInputBox() {
    this.messageEntered = '';                   // Reset the message input box 
  }

  createPMObject(hasRead: boolean, messageType: MessageTypes): Message {
    return {
      from: this.loggedInUser,
      to: this.activeChatUser,
      content: this.messageEntered,
      action: Action.SEND_PRIVATE_MSG,
      isRead: hasRead,                       // TODO: it needs to be true only when user read it! Show up in notification by default
      sentAt: new Date(Date.now()),
      messageType: messageType
    };
  }
}
