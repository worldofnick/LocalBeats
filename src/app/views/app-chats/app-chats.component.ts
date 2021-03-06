import {
  Component, Inject, OnInit, OnDestroy, Input, Output, ViewChild, AfterContentInit, ContentChild,
  AfterViewInit, ViewChildren, AfterViewChecked, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription, ISubscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatChipInputEvent, MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ENTER, COMMA, TAB } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs/Rx';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { FormControl } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';

import { SharedDataService } from 'app/services/shared/shared-data.service';
import { ChatsService } from 'app/services/chats/chats.service';
import { UserService } from 'app/services/auth/user.service';
import { SocketService } from 'app/services/chats/socket.service';
import { User } from '../../models/user';
import { Message } from '../../services/chats/model/message';
import { SocketEvent } from '../../services/chats/model/event';
import { Action } from '../../services/chats/model/action';
import { MessageTypes } from '../../services/chats/model/messageTypes';

@Component({
  selector: 'app-chats',
  templateUrl: './app-chats.component.html',
  styleUrls: ['./app-chats.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-100%)'
        }),
        animate('0.2s ease-in-out')
      ]),
      transition('* => void', [
        animate('0.1s 200ms ease-out', style({
          opacity: 0,
          transform: 'translateX(100%)'
        }))
      ])
    ])
  ]
})
export class AppChatsComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {

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
  activeChatUser: User = new User();
  connectedUsers: User[] = new Array();

  options: User[] = new Array();  // All users list to populate autocomplete with

  // ==============================================
  // Init Methods
  // ==============================================

  constructor(private media: ObservableMedia, public _snackBar: MatSnackBar, private cdr: ChangeDetectorRef,
    private _socketService: SocketService, public _chatsService: ChatsService, private router: Router,
    private _sharedDataService: SharedDataService, public dialog: MatDialog, private userService: UserService) {
    this.loggedInUser = this._chatsService.getCurrentLoggedInUser();
    this.initChatSideBarWithWithNewUsers();
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
      if (result === undefined) {
      }
      else if (result.recipientUser._id === undefined) {
      }
      else {
        if (this.isUserObjInConnectedUsers(result.recipientUser) !== -1) {
          this.changeActiveUser(result.recipientUser);
        } else {
          let recipient: User = result.recipientUser as User;
          this.connectedUsers.unshift(recipient);
          this.changeActiveUser(recipient);
        }
      }
    });
  }

  ngOnInit() {
    this.initIoConnection();
    this.chatSideBarInit();
  }

  ngAfterViewInit() {
    this.vc.first.nativeElement.focus();
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.activeChatUser = new User();
    this.cdr.detach();
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
    this._socketService.onEvent(SocketEvent.NEW_LOG_IN)
      .subscribe((message: Message) => {
        this.reloadChatSideBarWithNewConnectedUsers();         // reload the connectedUsers navBar
      });

    this._socketService.onEvent(SocketEvent.SMN_LOGGED_OUT)
      .subscribe((message: Message) => {
        this.reloadChatSideBarWithNewConnectedUsers();         // reload the connectedUsers navBar
      });

    this._socketService.onEvent(SocketEvent.SEND_PRIVATE_MSG)
      .subscribe((message: Message) => {
        const temp: Message = message as Message;

        // If you are the receiver and the sender is not already in the connectedUsers list,
        // add the user to list.
        if (!this.isUserInConnectedUsers(temp)) {
          if (this.loggedInUser._id !== temp.from._id) {
            this.connectedUsers.unshift(temp.from);
          }
        }
        // Else, if the chat is ongoing with this sender, reload the messages.
        if (this.activeChatUser._id === temp.from._id ||
          this.loggedInUser._id === temp.from._id) {
          this.activeChatMessages.push(temp);
        }

        if (this.activeChatUser._id === temp.from._id) {
          this._chatsService.markChatsAsReadBetweenTwoUser(this.activeChatUser._id, this.loggedInUser._id)
            .subscribe(
              (data: any) => {
                const fromUID = this.activeChatUser._id;
                // Make the unread count for that user to zero in unreadCounts[]
                const senderIndex = this._chatsService.unreadCounts.findIndex(x => x._id === fromUID);
                if (senderIndex !== -1) {
                  this._chatsService.unreadCounts[senderIndex].unreadCount = 0;
                }
              },
              (error: any) => {
                console.error(error);
              },
              () => {
                this._sharedDataService.setOverallChatUnreadCount(this.loggedInUser);
              }
            );
        }
        this._chatsService.getAllUnreadCountsForAllChatBuddies(this.connectedUsers);
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
          this.activeChatMessages = new Array();
          let temp = data as { messages: Message[] };
          this.activeChatMessages = temp.messages;
        },
        err => console.error('Error fetching PMs between 2 users: ', err),
        () => {
          this._socketService.send(Action.REQUEST_PM_SOCKET_ID, { serverPayload: this.activeChatMessages });
        }
      );
    }
  }

  // Subscribe takes 3 event handlers:
  // onNext, onError, onCompleted
  reloadChatSideBarWithNewConnectedUsers() {
    this._chatsService.getAllConversationBuddiesOfThisUser().subscribe(
      data => {
        const temp = data as { users: User[] };
        this.connectedUsers = new Array();
        for (let buddy of temp.users) {
          this.connectedUsers.push(buddy);
        }
      },
      err => console.error(err),
      () => {
        this.initiateAutocompleteOptions();
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
        this.activeChatUser = this.connectedUsers[0];
      },
      err => console.error(err),
      () => {

        // Get the unread labels for all users in the connectedUsers list (the side bar)
        this._chatsService.getAllUnreadCountsForAllChatBuddies(this.connectedUsers);

        // See if profile message clicked. If so, add it as first user or switch to exisitng one
        if (this._sharedDataService.isProfileUserRequestPending) {
          let indexInConnectedUsers = this.isUserObjInConnectedUsers(this._sharedDataService.profileButtonChatRecipient);
          if (indexInConnectedUsers === -1) {
            this.connectedUsers.unshift(this._sharedDataService.profileButtonChatRecipient);  // Add user to connected Users
          }
          this.activeChatUser = this._sharedDataService.profileButtonChatRecipient;
          this._sharedDataService.resetProfileMessageSharedProperties();
        }

        // See if go to message on snackbar clicked. If so, make it active user
        if (this._sharedDataService.isSnackBarMessageRequestPending) {
          let indexInConnectedUsers = this.isUserObjInConnectedUsers(this._sharedDataService.snackBarMessageRecipient);
          this.activeChatUser = this._sharedDataService.snackBarMessageRecipient;
          this._sharedDataService.resetSnackBarMessageSharedProperties();
        }

        this.initiateAutocompleteOptions();
        // Reload the active user's messages
        this.changeActiveUser(this.activeChatUser);
      }
    );
  }

  initiateAutocompleteOptions() {
    this.options = [];
    this._chatsService.getConnectionUsers().subscribe(
      data => {
        const temp = data as { users: User[] };
        this.options = temp.users;
      },
      err => console.error(err),
      () => {
      }
    );
  }

  changeActiveUser(user) {
    // Check if a blank new conversation was halfway started while switched to an existing user. If so, remove it.
    if (this.connectedUsers.length > 0) {
      this.activeChatUser = user;

      // Mark all PMs (from:activeChatUser, to: me) as read, then fetch the PMs between them
      this._chatsService.markChatsAsReadBetweenTwoUsersAuto(user._id, this.loggedInUser._id);

      this._chatsService.getPMsBetweenActiveAndLoggedInUser(this.loggedInUser, this.activeChatUser).subscribe(
        data => {
          this.activeChatMessages = new Array();
          const temp = data as { messages: Message[] };
          this.activeChatMessages = temp.messages;
        },
        err => console.error('Error fetching PMs between 2 users: ', err),
        () => {
          // Update the unread count on the topbar icon
          this._sharedDataService.setOverallChatUnreadCount(this.loggedInUser);
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
      if (this.messageEntered.trim().length > 0) {

        let privateMessage: Message;
        // Save the message in the DB
        privateMessage = this.createPMObject(false, MessageTypes.MSG);
        this._socketService.send(Action.SEND_PRIVATE_MSG, privateMessage);
        this.resetMessageInputBox();
      }
    };
  }

  topBarGoToProfileClicked() {
    this.router.navigate(['profile/', this.activeChatUser._id]);
  }

  resetMessageInputBox() {
    this.messageEntered = '';    // Reset the message input box
  }

  createPMObject(hasRead: boolean, messageType: MessageTypes): Message {
    let messageToSend = '';
    if (this.messageEntered.charAt(0) === '\n') {
      messageToSend = this.messageEntered.substr(1);
    } else {
      messageToSend = this.messageEntered;
    }

    return {
      from: this.loggedInUser,
      to: this.activeChatUser,
      content: messageToSend,
      action: Action.SEND_PRIVATE_MSG,
      isRead: hasRead,
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
