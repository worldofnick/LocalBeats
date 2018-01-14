import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
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
  egretThemes;

  constructor(private themeService: ThemeService, private userService: UserService, private router: Router) {}
  ngOnInit() {
    this.egretThemes = this.themeService.egretThemes;
    domHelper.toggleClass(document.body, 'collapsed-menu');
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  setSearchType() {
    this.onSearchTypeChange.emit(this.currentSearchType);
  }
  changeTheme(theme) {
    this.themeService.changeTheme(theme);
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