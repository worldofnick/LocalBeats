import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatDialog, MatChipInputEvent } from '@angular/material';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { Observable } from 'rxjs/Rx';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {FormControl} from '@angular/forms';

import { ChatsService } from 'app/services/chats/chats.service';
import { SocketService } from 'app/services/chats/socket.service';
import { User } from '../../models/user';
import { Message } from '../../services/chats/model/message';
import { SocketEvent } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';
import { MessageTypes } from '../../services/chats/model/messageTypes';

export class DummyUser {
  constructor(public firstName: string, public lastName: string, public email: string) { }
}

@Component({
  selector: 'app-chats',
  templateUrl: './app-chats.component.html',
  styleUrls: ['./app-chats.component.css']
})
export class AppChatsComponent implements OnInit {
  
  //TODO: add users to chat with, some form of notifications

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
  // Receipient users form Variables, chips
  // ==============================================
  recipientsFormControl = new FormControl();
  newConversationClicked: boolean = false;

  // TODO: change all to User from DummyUser
  options = [
    new DummyUser('Snorlax', 'Ketchum', 'snor@poke.com'),
    new DummyUser('Onix', 'Brock', 'onix@poke.com'),
    new DummyUser('Meowth', 'Rocket', 'meow@poke.com')
  ];

  filteredOptions: Observable<DummyUser[]>;

  isVisible: boolean = true;
  isSelectable: boolean = true;
  isRemovable: boolean = true;
  isAddOnBlur: boolean = true;
  separatorKeysCodes = [ENTER, COMMA];

  recipientChips = [ { name: 'pidgey@poke.com' }];

  // ==============================================
  // Init Methods
  // ==============================================

  constructor(private media: ObservableMedia, private _socketService: SocketService, private _chatsService: ChatsService) {
    this.loggedInUser = this._chatsService.getCurrentLoggedInUser();
    this.initChatSideBarWithWithNewUsers();
    console.log('Logged in User:', this._chatsService.getCurrentLoggedInUser());
  }

  ngOnInit() {
    this.initIoConnection();
    this.chatSideBarInit();
    this.initRecipientForm();
  }

  // ==============================================
  // Recipient Form Methods, Add button
  // ==============================================

  private initRecipientForm() {
    this.filteredOptions = this.recipientsFormControl.valueChanges
      .pipe(
        startWith<string | DummyUser>(''),
        map(value => typeof value === 'string' ? value : value.email),  //TODO: change to name?
        map(name => name ? this.filter(name) : this.options.slice())
      );
  }

  filter(name: string): DummyUser[] {
    return this.options.filter(option =>
      option.email.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  displayFn(user?: DummyUser): string | undefined {
    
    return user ? user.firstName + ' ' + user.lastName : undefined;
  }

  onStartNewConversationButtonClick() {
    //TODO: make so new blank user is added and is active, empty recipient form on right top bar
    this.newConversationClicked = true;
    console.log('New conversation button clicked!');
  }

  // Chip methods
  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our fruit
    if ((value || '').trim()) { this.recipientChips.push({ name: value.trim() }); }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(fruit: any): void {
    let index = this.recipientChips.indexOf(fruit);

    if (index >= 0) {
      this.recipientChips.splice(index, 1);
    }
  }

  // ==============================================
  // Others
  // ==============================================

  private initIoConnection(): void {
    // this._socketService.initSocket();

    // TODO: add:
    // this._socketService.socket.on('connect', () => {
    //        listen to all events inside it
    //});

    // Every time there is a new login/out, it reloads the chat side Bar.
    this._socketService.onEvent(SocketEvent.NEW_LOG_IN)                       // TODO: optimize to reload only online status and new, deleted users
      .subscribe((message: Message) => {
        console.log('New user logged in (chat event): ', message);
        this.reloadChatSideBarWithNewConnectedUsers();                   // reload the connectedUsers navBar
    });

    this._socketService.onEvent(SocketEvent.SMN_LOGGED_OUT)
      .subscribe( (message: Message) => {
        console.log('Some user logged out (chat event): ', message);
        this.reloadChatSideBarWithNewConnectedUsers();                   // reload the connectedUsers navBar
    });

    this._socketService.onEvent(SocketEvent.SEND_PRIVATE_MSG)
      .subscribe((message: Message) => {
        // Add response message[] to the activeChatMessages[]
        // this.activeChatMessages = new Array();      // Reset the array
        // for (let temp of message as Message[]) {
          // this.activeChatMessages.push(temp as Message);
        // };
        console.log('Private Chat message from server (chat event): ', message);
        const temp: Message = message as Message;
        this.activeChatMessages.push(temp);
        // console.log('Active Chat Messages var (chat event): ', this.activeChatMessages);
        
        // TODO: refresh UI?
    });

    // this._socketService.onEvent(Event.REQUEST_PM_SOCKET_ID)
    //   .subscribe((message: Message) => {
    //     console.log('Socket Request (chat event): ', message);
    //     console.log(' to == logged in? : ', (message.serverPayload.from._id === this.loggedInUser._id) ||
    //                                         (message.serverPayload.to._id === this.loggedInUser._id)) ;
    //     this.respondToIsItYouPMSocketRequest(message);
    // });
  }

  respondToIsItYouPMSocketRequest(message) {
    if ( (message.serverPayload.from._id === this.loggedInUser._id) ||
        (message.serverPayload.to._id === this.loggedInUser._id)) {

          this._chatsService.getPMsBetweenActiveAndLoggedInUser(this.loggedInUser, this.activeChatUser).subscribe(
            data => {
              // console.log('\n====\nUser PMs from Server DB: ', JSON.stringify(data));
              // console.log('\n====\nUser PMs from Server DB: ', data as {messages: Message[]} );
              this.activeChatMessages = new Array();
              let temp = data as {messages: Message[]};
              this.activeChatMessages = temp.messages;
            },
            err => console.error('Error fetching PMs between 2 users: ', err),
            () => { 
              console.log('Done fetching PMs from the server DB');
              console.log('Sending myself with messages[]: ', this.activeChatMessages);
              this._socketService.send(Action.REQUEST_PM_SOCKET_ID, {serverPayload: this.activeChatMessages} );
            }
        );
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
      () => {
        console.log('Done initializing users in chat side bar');
        // Reload the active user's messages
        this.changeActiveUser(this.activeChatUser);
      }
    );
  }

  changeActiveUser(user) {
    let connection;
    this.activeChatUser = user;
    console.log('New User clicked:', this.activeChatUser);

    this._chatsService.getPMsBetweenActiveAndLoggedInUser(this.loggedInUser, this.activeChatUser).subscribe(
      data => {
        // console.log('\n====\nUser PMs from Server DB: ', JSON.stringify(data));
        // console.log('\n====\nUser PMs from Server DB: ', data as {messages: Message[]} );
        this.activeChatMessages = new Array();
        let temp = data as {messages: Message[]};
        this.activeChatMessages = temp.messages;
      },
      err => console.error('Error fetching PMs between 2 users: ', err),
      () => console.log('Done fetching PMs from the server DB')
  );

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

      
      let privateMessage: Message;
      // CASE 1: Both users online. So do a socket event
      if (this.activeChatUser.isOnline) {

        // Save the message in the DB
        privateMessage = this.createPMObject(true, MessageTypes.MSG);
      }
      // CASE 2: The recipient is offline. So an HTTP request instead of socket event
      else {
        privateMessage = this.createPMObject(false, MessageTypes.MSG);
        
      }
      // this.awaitMessageSaveResponse(privateMessage);
      this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
      this.resetMessageInputBox();
    }
  }

  // awaitMessageSaveResponse(privateMessage: Message) {
  //   //TODO: change to promise, then?
  //   this._chatsService.savePrivateMessageToDB(privateMessage).subscribe(
  //     data => {
  //       console.log('\n====\nMessage save response from server: ', JSON.stringify(data));
  //       // console.log('\n====\nUser PMs from Server DB: ', data as {messages: Message[]} );
  //       // this.activeChatMessages = new Array();
  //       // let temp = data as {messages: Message[]};
  //       // this.activeChatMessages = temp.messages;
  //     },
  //     err => console.error('Error saving the message: ', err),
  //     () => { 
  //       console.log('Done saving the message to server DB. Sending socket request.');
  //       this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
  //     }
  //   );
  // }

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
