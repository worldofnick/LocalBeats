import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/auth/user.service';

@Component({
  selector: 'navigation',
  templateUrl: './navigation.template.html'
})
export class NavigationComponent {
  menuItems:any[];

  constructor(private userService: UserService) {}
  ngOnInit() {
    this.menuItems = [
      {
        name: 'HOME',
        type: 'link',
        tooltip: 'Home',
        icon: 'home',
        state: 'home'
      },
      {
        name: 'DASHBOARD',
        type: 'link',
        tooltip: 'Dashboard',
        icon: 'dashboard',
        state: 'dashboard'
      },
      {
        name: 'CHAT',
        type: 'link',
        tooltip: 'Chat',
        icon: 'chat',
        state: 'chat'
      },
      {
        name: 'CALENDAR',
        type: 'link',
        tooltip: 'Calendar',
        icon: 'date_range',
        state: 'calendar'
      },
      {
        name: 'PROFILE',
        type: 'dropDown',
        tooltip: 'Profile',
        icon: 'person',
        state: 'profile',
        sub: [
          {name: 'OVERVIEW', state: 'overview'},
          {name: 'SETTINGS', state: 'settings'},
          {name: 'BLANK', state: 'blank'},
        ]
      },
      {
        name: 'EVENTS',
        type: 'link',
        tooltip: 'My Events',
        icon: 'event',
        state: 'events'
      },
      {
        name: 'SESSIONS',
        type: 'dropDown',
        tooltip: 'Pages',
        icon: 'view_carousel',
        state: 'sessions',
        sub: [
          {name: 'SIGNUP', state: 'signup'},
          {name: 'SIGNIN', state: 'signin'},
          {name: 'FORGOT', state: 'forgot-password'},
          {name: 'LOCKSCREEN', state: 'lockscreen'},
          {name: 'NOTFOUND', state: '404'},
          {name: 'ERROR', state: 'error'}
        ]
      }
    ];
  }
}