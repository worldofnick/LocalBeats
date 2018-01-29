import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatDialog } from '@angular/material';
import { ChatsService } from 'app/services/chats/chats.service';

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

  activeChatUser = {
    name: 'Gevorg Spartak',
    photo: 'assets/images/face-2.jpg',
    isOnline: true,
    lastMsg: 'Hello!'
  };

  connectedUsers = []
  constructor(private media: ObservableMedia, private _chatsService: ChatsService) { }

  ngOnInit() {
    this.chatSideBarInit();
    this.connectedUsers = this._chatsService.getConnectionUsers();
  }
  changeActiveUser(user) {
    this.activeChatUser = user;
    console.log('New User clicked:', this.activeChatUser);
  }


  updateSidenav() {
    var self = this;
    setTimeout(() => {
      self.isSidenavOpen = !self.isMobile;
      self.sideNave.mode = self.isMobile ? 'over' : 'side';
    })
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
