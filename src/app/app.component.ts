import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import * as hopscotch from 'hopscotch';
import 'rxjs/add/operator/filter';
import { RoutePartsService } from "./services/route-parts/route-parts.service";
import { SocketService } from 'app/services/chats/socket.service';
import { UserService } from './services/auth/user.service';
import { SocketEvent } from 'app/services/chats/model/event';
import { Message } from 'app/services/chats/model/message';
import { Notification } from './models/notification';
import { MatSnackBar, MatSnackBarRef } from '@angular/material';
import { SharedDataService } from './services/shared/shared-data.service';
import { JwtHelper } from 'angular2-jwt';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  appTitle = 'localBeats';
  pageTitle = '';

  constructor(public title: Title,
    private router: Router,
    private activeRoute: ActivatedRoute,
    public snackBar: MatSnackBar,
    private sharedDataService: SharedDataService,
    private routePartsService: RoutePartsService,
    private userService: UserService,
    private _sharedDataService: SharedDataService,
    private _socketService: SocketService) { }

  ngOnInit() {
    this._socketService.initSocket();
    this.initIoConnection();
    let jwtHelper: JwtHelper = new JwtHelper();
    const token = sessionStorage.getItem('token');
    if(token) {
      let decodedToken = jwtHelper.decodeToken(token);
      this.userService.getUserByID(decodedToken.id).then((user:User) => {
        this.userService.userLoaded(user, token, true, false);
        this.userService.getNotificationsCountForUser(user._id);
        this.userService.getNotificationsForUser(user._id);
        this.sharedDataService.setOverallChatUnreadCount(user);
      });
    }
    this.changePageTitle();
  }
  changePageTitle() {
    this.router.events.filter(event => event instanceof NavigationEnd).subscribe((routeChange) => {
      var routeParts = this.routePartsService.generateRouteParts(this.activeRoute.snapshot);
      if (!routeParts.length)
        return this.title.setTitle(this.appTitle);
      // Extract title from parts;
      this.pageTitle = routeParts
                      .reverse()
                      .map((part) => part.title )
                      .reduce((partA, partI) => {return `${partA} > ${partI}`});
      this.pageTitle += ` | ${this.appTitle}`;
      this.title.setTitle(this.pageTitle);
      
    });
  }
  
  initIoConnection() {
    this._socketService.onEvent(SocketEvent.SEND_PRIVATE_MSG)
      .subscribe((message: Message) => {
        const temp: Message = message as Message;
        this.openNewMessageSnackBar(temp);
        if (temp.to._id === this.userService.user._id) {
          this._sharedDataService.setOverallChatUnreadCount(this.userService.user);
        }
      });

    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((message: Notification) => {
        const temp: Notification = message as Notification;
        this.openNotificationSnackBar(temp);
      });
  }

  /**
   * Display a snack bar pop-up whenever this user gets a new PM
   * @param message The original PM that is received
   */
  openNewMessageSnackBar(message: Message) {
    // Only if on the recipient's profile:
    if (this.userService.user._id !== message.from._id) {
      let snackBarRef = this.snackBar.open('You have a new message from ' + message.from.firstName +
        ' ' + message.from.lastName, 'Go to message...', { duration: 3500 });

      snackBarRef.onAction().subscribe(() => {
        this._sharedDataService.setProfileMessageSharedProperties(message.from);
        this.router.navigate(['/chat']);
        // this._socketService.send(Action.OPEN_SNACK_BAR_PM, message);
      });
    };
  }

  /**
   * Display a snack bar pop-up whenever this user gets a new notification
   * @param message The original notification that is received
   */
  openNotificationSnackBar(message: Notification) {
    let snackBarRef = this.snackBar.open('You have a new notification from ' + message.senderID.firstName + ' ' + message.senderID.lastName,
      'Go to...', { duration: 3500 });

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(message.route);
    });
  }
}
