import { Component, Inject, OnInit, Input, Output, ViewChild, AfterContentInit, ContentChild, 
        AfterViewInit, ViewChildren, AfterViewChecked, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatChipInputEvent, MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ENTER, COMMA, TAB } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs/Rx';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { FormControl } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';

import { ChatsService } from 'app/services/chats/chats.service';
import { SocketService } from 'app/services/chats/socket.service';
import { User } from '../../models/user';
import { Message } from '../../services/chats/model/message';
import { SocketEvent } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';
import { MessageTypes } from '../../services/chats/model/messageTypes';

@Component({
  selector: 'app-chats',
  templateUrl: './app-chats.component.html',
  styleUrls: ['./app-chats.component.css']
  // ,
  // animations: [
  //   trigger('flyInOut', [
  //     state('in', style({ opacity: 1, transform: 'translateX(0)' })),
  //     transition('void => *', [
  //       style({
  //         opacity: 0,
  //         transform: 'translateX(-100%)'
  //       }),
  //       animate('0.2s ease-in-out')
  //     ]),
  //     transition('* => void', [
  //       animate('0.1s 200ms ease-out', style({
  //         opacity: 0,
  //         transform: 'translateX(100%)'
  //       }))
  //     ])
  //   ])
  // ]
})
export class AppChatsComponent implements OnInit, AfterViewChecked, AfterViewInit {

  @ViewChildren('messageInputBox') vc;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

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
  isProfileUserRequestPending = false;
  isSnackBarRequestPending = false;
  profileRecipient: User = new User();
  snackBarRecipient: User = new User();

  options: User[] = new Array();  // All users list to populate autocomplete with
  
  // ==============================================
  // Init Methods
  // ==============================================

  constructor(private media: ObservableMedia, public _snackBar: MatSnackBar, private cdr: ChangeDetectorRef,
    private _socketService: SocketService, private _chatsService: ChatsService, private router: Router, 
    public dialog: MatDialog) {
    this.loggedInUser = this._chatsService.getCurrentLoggedInUser();
    
    this.initChatSideBarWithWithNewUsers();
    console.log('Init active user:', this.activeChatUser);
    console.log('Init connectedUsers user:', this.connectedUsers);

    console.log('Logged in User:', this.loggedInUser);
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '50%',
      data: {
        usersList: this.options,
        loggedInUser: this.loggedInUser,
        recipientUser: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed with result: ', result);
      if (result === undefined) {
        console.log('Undefined object. No action taken');
      }
      else if ( result.recipientUser._id === undefined ) {
        console.log('Not a user object. No action taken');
      }
      else {
        if ( this.isUserObjInConnectedUsers(result.recipientUser) !== -1 ) {
          console.log('Already chatting with ' + result.recipientUser.firstName + '. Switching to that thread');
          this.changeActiveUser(result.recipientUser);
        } else {
          console.log('Starting new chat with ' + result.recipientUser.firstName);
          let recipient: User = result.recipientUser as User;
          console.log('New recipient: ', recipient);
          this.connectedUsers.unshift(recipient);
          this.changeActiveUser(recipient);
        }
      }
    });
  }

  ngOnInit() {
    this.initIoConnection();
    this.chatSideBarInit();
    console.log('On open, connectd users: ', this.connectedUsers);
  }

  ngAfterViewInit() {
    this._socketService.send(SocketEvent.NOTIFY_SERVER_CHAT_LOADED, null);
    this.vc.first.nativeElement.focus();
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  isUserObjInConnectedUsers(newUser: User): number {

    for (let i = 0; i < this.connectedUsers.length; i++) {
      let chatBuddy: User = this.connectedUsers[i];
        if (chatBuddy._id === newUser._id) {
          return i;
        }
      }
      return -1;
  }

  // ==============================================
  // Others
  // ==============================================

  private initIoConnection(): void {
    // Every time there is a new login/out, it reloads the chat side Bar.
    this._socketService.onEvent(SocketEvent.NEW_LOG_IN)                       // TODO: optimize to reload only online status and new, deleted users
      .subscribe((message: Message) => {
        console.log('New user logged in (chat event): ', message);
        this.reloadChatSideBarWithNewConnectedUsers();                   // reload the connectedUsers navBar
      });

    this._socketService.onEvent(SocketEvent.SMN_LOGGED_OUT)
      .subscribe((message: Message) => {
        console.log('Some user logged out (chat event): ', message);
        this.reloadChatSideBarWithNewConnectedUsers();                   // reload the connectedUsers navBar
      });

    this._socketService.onEvent(SocketEvent.SEND_PRIVATE_MSG)
      .subscribe((message: Message) => {
        // this.isBlankTemplate = false;
        console.log('Private Chat message from server (chat event): ', message);
        const temp: Message = message as Message;

        // If you are the receiver and the sender is not already in the connectedUsers list,
        // add the user to list. Else, if the chat is ongoing with this sender, reload the messages.
        if (!this.isUserInConnectedUsers(temp)) {
          if (this.loggedInUser._id !== temp.from._id) {
            this.connectedUsers.unshift(temp.from);
          }
        }
        if (this.activeChatUser._id === temp.from._id ||
          this.loggedInUser._id === temp.from._id) {
          this.activeChatMessages.push(temp);
        } else {
          // TODO: push notification, notification dot if not active user
        }
        // TODO: refresh UI?
      });
      
      this._socketService.onEvent(SocketEvent.REQUEST_MSG_FROM_PROFILE_BUTTON)
      .subscribe((message: Message) => {
        console.log('Messaging from profile requested for (chat event): ', message);
        this.profileRecipient = message.to as User;
        this.isProfileUserRequestPending = true;
        console.log(' <<< Calling re-initialzie on socket profile button event received >>> ');
        this.initChatSideBarWithWithNewUsers();
      });

      this._socketService.onEvent(SocketEvent.OPEN_SNACK_BAR_PM)
      .subscribe((message: Message) => {
        console.log('Opening message from snackbar action (chat event): ', message);
        this.snackBarRecipient = message.from as User;
        this.isSnackBarRequestPending = true;
      });
  }

  isUserInConnectedUsers(message): boolean {
    for (let chatBuddy of this.connectedUsers) {
      if (chatBuddy._id === message.from._id) {
        return true;
      }
    }
    return false;
  }

  respondToIsItYouPMSocketRequest(message) {
    if ((message.serverPayload.from._id === this.loggedInUser._id) ||
      (message.serverPayload.to._id === this.loggedInUser._id)) {

      this._chatsService.getPMsBetweenActiveAndLoggedInUser(this.loggedInUser, this.activeChatUser).subscribe(
        data => {
          // console.log('\n====\nUser PMs from Server DB: ', JSON.stringify(data));
          // console.log('\n====\nUser PMs from Server DB: ', data as {messages: Message[]} );
          this.activeChatMessages = new Array();
          let temp = data as { messages: Message[] };
          this.activeChatMessages = temp.messages;
        },
        err => console.error('Error fetching PMs between 2 users: ', err),
        () => {
          console.log('Done fetching PMs from the server DB');
          console.log('Sending myself with messages[]: ', this.activeChatMessages);
          this._socketService.send(Action.REQUEST_PM_SOCKET_ID, { serverPayload: this.activeChatMessages });
        }
      );
    }
  }

  // SUbscribe takes 3 event handlers:
  // onNext, onError, onCompleted
  reloadChatSideBarWithNewConnectedUsers() {
    this._chatsService.getAllConversationBuddiesOfThisUser().subscribe(
      data => {
        // console.log('User DATA: ', data);
        const temp = data as { users: User[] };
        this.connectedUsers = new Array();
        for (let buddy of temp.users) {
          this.connectedUsers.push(buddy);
        }
        console.log('Side Bar Connected Users:', this.connectedUsers);
      },
      err => console.error(err),
      () => {
        this.initiateAutocompleteOptions();
        console.log('Done reloading users in chat side bar');
        // this.chatSideBarInit();
      }
    );
  }

  initChatSideBarWithWithNewUsers() {
    this._chatsService.getAllConversationBuddiesOfThisUser().subscribe(
      data => {
        const temp = data as { users: User[] };
        this.connectedUsers = new Array();
        for (let buddy of temp.users) {
          this.connectedUsers.push(buddy);
        }
        console.log('(Init) Side Bar Connected Users:', this.connectedUsers);
        this.activeChatUser = this.connectedUsers[0]; // TODO: change to whatever filter applied later
      },
      err => console.error(err),
      () => {
        this.initiateAutocompleteOptions();
        console.log('Done initializing users in chat side bar');
        // Reload the active user's messages
        this.changeActiveUser(this.activeChatUser);
      }
    );
  }

  initiateAutocompleteOptions() {
    this.options = [];
    this._chatsService.getConnectionUsers().subscribe(
      data => {
        // console.log('User DATA: ', data);
        const temp = data as { users: User[] };
        this.options = temp.users;
        console.log('Options: ', this.options);
      },
      err => console.error(err),
      () => {
        console.log('Done initializing autocomplete users');
      }
    );
  }

  changeActiveUser(user) {
    // Check if a blank new conversation was halfway started while switched to an existing user. If so, remove it.
    if (this.connectedUsers.length > 0) {
      // if (this.connectedUsers[0].firstName === 'New ' && this.connectedUsers[0].lastName === 'Message') {
      //   this.connectedUsers.shift();
      //   // this.newConversationClicked = false;
      // }

      let connection;
      if (this.isProfileUserRequestPending) {
        this.isProfileUserRequestPending = false;
        let indexInConnectedUsers = this.isUserObjInConnectedUsers(this.profileRecipient);
        if ( indexInConnectedUsers === -1 ) {
          this.connectedUsers.unshift(this.profileRecipient);  // Add user to connected Users
        }
        this.activeChatUser = this.profileRecipient;
      } 
      else if (this.isSnackBarRequestPending) {
        this.isSnackBarRequestPending = false;
        let indexInConnectedUsers = this.isUserObjInConnectedUsers(this.snackBarRecipient);
        if ( indexInConnectedUsers === -1 ) {
          this.connectedUsers.unshift(this.snackBarRecipient);  // Add user to connected Users
        }
        this.activeChatUser = this.snackBarRecipient;
      }
      else {
        this.activeChatUser = user;
        console.log('New User clicked:', this.activeChatUser);
      }

      this._chatsService.getPMsBetweenActiveAndLoggedInUser(this.loggedInUser, this.activeChatUser).subscribe(
        data => {
          // console.log('\n====\nUser PMs from Server DB: ', JSON.stringify(data));
          // console.log('\n====\nUser PMs from Server DB: ', data as {messages: Message[]} );
          this.activeChatMessages = new Array();
          let temp = data as { messages: Message[] };
          this.activeChatMessages = temp.messages;
        },
        err => console.error('Error fetching PMs between 2 users: ', err),
        () => {
          console.log('Done fetching PMs from the server DB:', this.activeChatMessages);
          this.profileRecipient = new User();
          this.snackBarRecipient = new User();
          this.isProfileUserRequestPending = false;
          this.isSnackBarRequestPending = false;
        }
      );
      this.vc.first.nativeElement.focus();
      this.cdr.detectChanges();
    }
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

  sendMessageClicked(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      console.log('-------CHAT UI---------');
    console.log('%s entered the message: %s', this.loggedInUser.firstName, this.messageEntered);
    console.log('Sender: ', this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName);
    console.log('Receiver: ', this.activeChatUser.firstName + ' ' + this.activeChatUser.lastName);
    console.log('---------------------');
    // If the user entered non-blank message and hit send, communicate with server

    if (this.messageEntered.trim().length > 0) {


      let privateMessage: Message;
      // CASE 1: Both users online. So do a socket event
      if (this.activeChatUser.isOnline) {

        // Save the message in the DB
        privateMessage = this.createPMObject(false, MessageTypes.MSG);
      }
      // CASE 2: The recipient is offline. So an HTTP request instead of socket event
      else {
        privateMessage = this.createPMObject(false, MessageTypes.MSG);

      }
      // this.awaitMessageSaveResponse(privateMessage);
      this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
      this.resetMessageInputBox();
    }
    };
  }

  topBarGoToProfileClicked() {
    console.log('Go to profile clicked for user: ', this.activeChatUser);
    this.router.navigate(['profile/', this.activeChatUser._id]);
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

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
  styleUrls: ['dialog-overview-example-dialog.css']
})
export class DialogOverviewExampleDialog {

  recipientsFormControl = new FormControl();
  filteredOptions: Observable<User[]>;
  allUsers: User[] = new Array();

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      console.log('From dialog, USERS: ', data.usersList);
      this.allUsers = data.usersList;
      this.initRecipientForm();
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private initRecipientForm() {
    this.filteredOptions = this.recipientsFormControl.valueChanges
      .pipe(
      startWith<string | User>(''),
      map(value => typeof value === 'string' ? value : value.firstName + ' ' + value.lastName),  //TODO: change to name?
      map(name => name ? this.filter(name) : this.allUsers.slice())
      );
  }

  filter(name: string): User[] {
    return this.allUsers.filter(option =>
      (option.firstName + ' ' + option.lastName).toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  displayFn(user?: User): string | undefined {

    return user ? user.firstName + ' ' + user.lastName : undefined;
  }
}