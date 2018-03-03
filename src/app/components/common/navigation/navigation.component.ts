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
        name: 'Home',
        type: 'link',
        tooltip: 'Home',
        icon: 'home',
        state: 'home'
      },
      {
        name: 'Profile',
        type: 'dropDown',
        tooltip: 'Profile',
        icon: 'person',
        state: 'profile',
        sub: [
          {name: 'Overview', state: 'overview'},
          {name: 'Settings', state: 'settings'}
        ]
      },
      {
        name: 'Chat',
        type: 'link',
        tooltip: 'Chat',
        icon: 'chat',
        state: 'chat'
      },
      {
        name: 'Calendar',
        type: 'link',
        tooltip: 'Calendar',
        icon: 'date_range',
        state: 'calendar'
      },
      {
        name: 'My Performances',
        type: 'link',
        tooltip: 'My Performances',
        icon: 'music_note',
        state: 'myperformances'
      },
      {
        name: 'My Events',
        type: 'link',
        tooltip: 'My Events',
        icon: 'music_note',
        state: 'myevents'
      }
    ];
  }
}