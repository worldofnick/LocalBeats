import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

interface IMenuItem {
  type: string,       // Possible values: link/dropDown/icon/separator/extLink
  name?: string,      // Used as display text for item and title for separator type
  state?: string,     // Router state
  icon?: string,      // Item icon name
  tooltip?: string,   // Tooltip text 
  disabled?: boolean, // If true, item will not be appeared in sidenav.
  sub?: IChildItem[]  // Dropdown items
}
interface IChildItem {
  name: string,       // Display text
  state: string       // Router state
}

@Injectable()
export class NavigationService {
  constructor() {}

  defaultMenu:IMenuItem[] = [
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
  ]
  
  // sets iconMenu as default;
  menuItems = new BehaviorSubject<IMenuItem[]>(this.defaultMenu);
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();
}