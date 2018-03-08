import { Injectable } from '@angular/core';
import * as domHelper from '../../helpers/dom.helper';
@Injectable()
export class ThemeService {
  localbeatsThemes = [{
    name: 'localbeats-blue',
    baseColor: '#247ba0',
    isActive: false
  }];
  activatedThemeName: String;
  constructor() {
    this.changeTheme({name: 'localbeats-blue'});
  }
  changeTheme(theme) {
    domHelper.changeTheme(this.localbeatsThemes, theme.name);
    this.localbeatsThemes.forEach((t) => {
      t.isActive = false;
      if(t.name === theme.name) {
        t.isActive = true;
        this.activatedThemeName = theme.name;
      }
    });
  }
}
