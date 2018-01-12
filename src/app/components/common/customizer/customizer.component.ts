import { Component, OnInit, Input } from '@angular/core';
import { NavigationService } from "../../../services/navigation/navigation.service";
import * as domHelper from '../../../helpers/dom.helper';

@Component({
  selector: 'app-customizer',
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.css']
})
export class CustomizerComponent implements OnInit {
  isCustomizerOpen: boolean = false;
  selectedMenu: string = 'icon-menu';
  isBreadcrumbEnabled = true;
  isTopbarFixed = false;
  @Input() breadcrumb;
  sidenavTypes = [{
    name: 'Default Menu',
    value: 'default-menu'
  }, {
    name: 'Separator Menu',
    value: 'separator-menu'
  }, {
    name: 'Icon Menu',
    value: 'icon-menu'
  }]
  constructor(private navService: NavigationService) { }

  ngOnInit() { }
  changeSidenav(data) {
    this.navService.publishNavigationChange(data.value)
  }
  toggleBreadcrumb(data) {
    this.breadcrumb.isEnabled = data.checked;

    this.toggleTopbarFixed({})
  }

  toggleTopbarFixed(data) {
    if (!this.isTopbarFixed) {
      this.removeTopbarFixed();
    } else {
      if (this.isBreadcrumbEnabled) {
        this.removeTopbarFixed();
        domHelper.addClass(document.body, 'fixed-topbar-breadcrumb')
      } else {
        this.removeTopbarFixed();
        domHelper.addClass(document.body, 'fixed-topbar')
      }
    }
  }
  removeTopbarFixed() {
    domHelper.removeClass(document.body, 'fixed-topbar');
    domHelper.removeClass(document.body, 'fixed-topbar-breadcrumb');
  }
}