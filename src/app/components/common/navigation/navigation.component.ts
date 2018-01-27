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
        name: 'PROFILE',
        type: 'dropDown',
        tooltip: 'Profile',
        icon: 'person',
        state: 'profile',
        sub: [
          {name: 'OVERVIEW', state: 'overview'},
          {name: 'SETTINGS', state: 'settings'}
        ]
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
      }
    ];
  }
}