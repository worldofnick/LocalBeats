import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatDialog } from '@angular/material';
import { ChatsService } from 'app/services/chats/chats.service';
import { User } from '../../models/user';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-chats',
  templateUrl: './app-chats.component.html',
  styleUrls: ['./app-chats.component.css']
})
export class AppChatsComponent implements OnInit {
  isMobile;
  screenSizeWatcher: Subscription;
  isSidenavOpen: Boolean = true;
  @ViewChild(MatSidenav) private sideNave: MatSidenav;

  messageEntered: string;
  loggedInUser: User = new User();

  //TODO: set to first user in connectedUsers list or one with highest unread count
  activeChatUser: User = new User();

  connectedUsers: User[] = new Array();

  constructor(private media: ObservableMedia, private _chatsService: ChatsService) {
    this.loggedInUser = this._chatsService.getCurrentLoggedInUser();
    this.getAllUsers();
    console.log('Logged in User:', this._chatsService.getCurrentLoggedInUser());
  }

  ngOnInit() {
    this.chatSideBarInit();
  }

  // SUbscribe takes 3 event handlers:
  // onNext, onError, onCompleted
  getAllUsers() {
    this._chatsService.getConnectionUsers().subscribe(
      data => {
        console.log('User DATA: ', data);
        const temp = data as { users: User[] };
        console.log('Cast: ', temp.users);
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
    this.activeChatUser = user;
    console.log('New User clicked:', this.activeChatUser);
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

  public connection;

  sendMessageClicked() {
    console.log('User entered the message: ', this.messageEntered);

    // If the user entered non-blank message and hit send, communicate with server
    if (this.messageEntered.trim().length > 0) {
      this._chatsService.sendMessage(this.messageEntered);
      this.messageEntered = '';

      this.connection = this._chatsService.getServerMsgAcknowledge().subscribe(message => {
        console.log('Acknowledge message from server : ', message);
      });
    }
  }
}
