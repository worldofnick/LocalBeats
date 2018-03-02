import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private _userService: UserService) {}


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this._userService.isAuthenticated()) {
      this.router.navigate(['/home']);            // TODO: can change it to sign in screen
      return false;
    }
    return true;
  }
}
