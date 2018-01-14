import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl} from '@angular/forms';
import * as domHelper from '../../../helpers/dom.helper';
import { ThemeService } from '../../../services/theme/theme.service';
import { UserService } from '../../../services/auth/user.service';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.template.html'
})
export class TopbarComponent implements OnInit {
  @Input() sidenav;
  @Input() notificPanel;
  @Output() onSearchTypeChange = new EventEmitter<any>();
  currentSearchType = 'Musician';
  searchTypes = ['Musician', 'Event']
  selectedValues: string[];
  foods = [
    { value: 'rock', viewValue: 'Rock' },
    { value: 'country', viewValue: 'Country' },
    { value: 'jazz', viewValue: 'Jazz' }
  ];

  constructor(private userService: UserService, private router: Router) {}
  ngOnInit() {
    domHelper.toggleClass(document.body, 'collapsed-menu');
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  setSearchType() {
    this.onSearchTypeChange.emit(this.currentSearchType);
  }

  toggleNotific() {
    this.notificPanel.toggle();
  }
  toggleSidenav() {
    this.sidenav.toggle();
  }
  toggleCollapse() {
    let appBody = document.body;
    domHelper.toggleClass(appBody, 'collapsed-menu');
    domHelper.removeClass(document.getElementsByClassName('has-submenu'), 'open');
    // Fix for sidebar
    if(!domHelper.hasClass(appBody, 'collapsed-menu')) {
      (<HTMLElement>document.querySelector('mat-sidenav-content')).style.marginLeft = '240px'
    }
  }
}