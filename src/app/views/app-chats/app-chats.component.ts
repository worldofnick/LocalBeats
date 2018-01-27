import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { MatSidenav, MatDialog } from '@angular/material';
import { UserService } from '../../services/auth/user.service';
import { User } from '../../models/user';
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

  user: User = new User();

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
  constructor(private media: ObservableMedia, private userService: UserService, ) { 

  }

  ngOnInit() {
    this.user = this.userService.user;
    this.chatSideBarInit();

    this.startSendBird('Pikachu', 'Pikachu');
    console.log('Current logged in user (chat): ' + JSON.stringify(this.user));
  }
  changeActiveUser(user) {
    this.activeChatUser = user;
  }


  updateSidenav() {
    let self = this;
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

  /***********************************************
  *            SendBird Settings
  **********************************************/
  sb: any;
  appId:string = '9DA1B1F4-0BE6-4DA8-82C5-2E81DAB56F23';

  startSendBird(userId, nickName) {
    this.sb = new SendBird({
      appId: this.appId
    });
  
    this.sb.connect(userId, function(user, error){
      if (error) {
        console.log('Failed to connect to the SendBird Servers: ' + JSON.stringify(error));
        return;
      } else {
        console.log('Connected to the SendBird Servers: ' + user);
      }
    });
  }
}
