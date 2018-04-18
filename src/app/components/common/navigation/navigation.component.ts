import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { UserService } from '../../../services/auth/user.service';
import { User } from '../../../models/user';

@Component({
  selector: 'navigation',
  templateUrl: './navigation.template.html'
})
export class NavigationComponent {
  menuItems:any[];
  private user:User = null;
  private userSubscription: ISubscription;

  constructor(private userService: UserService) {}
  ngOnInit() {
    this.userSubscription = this.userService.userResult.subscribe(user => this.user = user);
    this.menuItems = [
      {
        name: 'Home',
        type: 'link',
        tooltip: 'Home',
        icon: 'home',
        state: 'home'
      },
      {
        name: 'About',
        type: 'link',
        tooltip: 'About',
        icon: 'album',
        state: 'about'
      },
      {
        name: 'Log in',
        type: 'link',
        tooltip: 'Log in',
        icon: 'exit_to_app',
        state: 'auth'
      },
      {
        name: 'Profile',
        type: 'link',
        tooltip: 'Profile',
        icon: 'person',
        state: 'profile'
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
        tooltip: 'Performances',
        icon: 'music_note',
        state: 'bookingmanagement/myperformances'
      },
      {
        name: 'My Events',
        type: 'link',
        tooltip: 'Events',
        icon: 'event_available',
        state: 'bookingmanagement/myevents'
      }
    ];
  }
}