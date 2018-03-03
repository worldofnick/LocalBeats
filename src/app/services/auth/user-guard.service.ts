import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from '@angular/core';
import { UserService } from "./user.service";
@Injectable()
export class UserGuard implements CanActivate {
    
    constructor(private authService: UserService) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        return this.authService.isAuthenticated();
    }
}