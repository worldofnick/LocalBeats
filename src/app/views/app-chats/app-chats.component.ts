import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatDialog } from '@angular/material';
import * as SendBird from 'SendBird';

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

  activeChatUser = {
    name: 'Gevorg Spartak',
    photo: 'assets/images/face-2.jpg',
    isOnline: true,
    lastMsg: 'Hello!'
  };

  connectedUsers = [{
    name: 'Gevorg Spartak',
    photo: 'assets/images/face-2.jpg',
    isOnline: true,
    lastMsg: 'What\'s going!'
  }, {
    name: 'Petros Toros',
    photo: 'assets/images/face-4.jpg',
    isOnline: true,
    lastMsg: 'Send me the stories.'
  }, {
    name: 'Henrik Gevorg',
    photo: 'assets/images/face-5.jpg',
    isOnline: false,
    lastMsg: 'Great work!!'
  }, {
    name: 'Gevorg Spartak',
    photo: 'assets/images/face-6.jpg',
    isOnline: false,
    lastMsg: 'Bye'
  }, {
    name: 'Petros Toros',
    photo: 'assets/images/face-7.jpg',
    isOnline: true,
    lastMsg: 'We\'ll talk later'
  }]
  constructor(private media: ObservableMedia) { }

  ngOnInit() {
    this.chatSideBarInit();
  }
  changeActiveUser(user) {
    this.activeChatUser = user;
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
}
