import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ISubscription } from "rxjs/Subscription";
import { SocketService } from 'app/services/chats/socket.service';
import { SocketEvent } from 'app/services/chats/model/event';
import { Message } from 'app/services/chats/model/message';
import { MatSnackBar, MatSnackBarRef } from '@angular/material';
import { UserService } from 'app/services/auth/user.service';
import { NotificationService } from '../../services/notification/notification.service';
import * as socketIO from 'socket.io-client';
import { Notification } from '../../models/notification';
import { Router } from '@angular/router';
import { SearchTerms, Location } from '../../models/search';
import { SearchService } from '../../services/search/search.service';
import { Action } from '../../services/chats/model/action';
import { User } from '../../models/user';
import { SharedDataService } from '../../services/shared/shared-data.service';
import { PageEvent } from '@angular/material';
import { MatPaginatorModule } from '@angular/material/paginator';
import { allResolved } from 'q';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private user: User = null;
  private userSubscription: ISubscription;
  @Input('backgroundGray') public backgroundGray;
  contactForm: FormGroup;


  // suggested info
  searchTypes: string[] = ['artist', 'host', 'event'];
  genresList: string[] = ['rock', 'country', 'jazz', 'blues', 'rap'];
  eventsList: string[] = ['wedding', 'birthday', 'business'];
  currentSearch: SearchTerms = new SearchTerms('Artist', '', null, ['all genres'], ['all events'],
                                this._userService.user._id, null, null);

  results: User[] = [];
  allResults: User[] = [];
  searchType: string;

  pageIndex: number = 0;
  pageSize = 4; // default page size is 15
  pageSizeOptions = [4];

  constructor(
    private snackBar: MatSnackBar,
    private router : Router,
    private _sharedDataService: SharedDataService,
    private _userService: UserService,
    private _socketService: SocketService,
    private fb: FormBuilder,
    private searchService: SearchService,
  ) { }

  ngOnInit() {

    this.initIoConnection();            // Listen to server for any registered events inside this method
    this.showSnackBarIfNeeded();
    this.userSubscription = this._userService.userResult.subscribe(user => this.user = user);
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', Validators.required]
    });

    // search for event or artist not event
    this.searchService.userSearch(this.currentSearch).then((users: User[]) => {
      this.allResults = users;
      // this.searchService.changeResult(this.results, this.currentSearch.searchType);
      this.updateResults();
    });

  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }



  private updateResults() {
    let startingIndex = (this.pageIndex + 1) * this.pageSize - this.pageSize;
    let endIndex = startingIndex + this.pageSize;
    var i: number;

    this.results = Array<any>();
    // Slice the results array
    for (i = startingIndex; i < endIndex && i < this.allResults.length; i++) {
      this.results.push(this.allResults[i]);
    }

  }
  private pageEvent(pageEvent: PageEvent) {
    this.pageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    this.updateResults();
    // Scroll to top of page
    window.scrollTo(0, 0);
  }
  // Shows the snackbar if needed when coming back from a redirect
  showSnackBarIfNeeded() {
    if (this.router.url.indexOf('success=true') >= 0) {
      // Get the new user object that was updated by the backend
      let snackBarRef = this.snackBar.open('Stripe Account Linked!', "", {
        duration: 1500,
      });
      this.router.navigate(['/profile/settings'], {queryParams: {stripe: true}});
    } else if (this.router.url.indexOf('success=false') >= 0) {
      // failure
      let snackBarRef = this.snackBar.open("Failed to Link Account", "", {
        duration: 1500,
      });
      this.router.navigate(['/profile/settings'], {queryParams: {stripe: true}});
    } else if (this.router.url.indexOf('updated=true') >= 0) {
      let snackBarRef = this.snackBar.open("Stripe Details Updated", "", {
        duration: 1500,
      });
      this.router.navigate(['/profile/settings'], {queryParams: {stripe: true}});
    } else if (this.router.url.indexOf('updated=false') >= 0) {
      // failure
      let snackBarRef = this.snackBar.open("Failed to Update Stripe Details", "", {
        duration: 1500,
      });
      this.router.navigate(['/profile/settings'], {queryParams: {stripe: true}});
  }
}

  /**
   * Listens to the server for any registered events and takes action accordingly.
   */
  initIoConnection() {
    this._socketService.onEvent(SocketEvent.SEND_PRIVATE_MSG)
      .subscribe((message: Message) => {
        console.log('PM from server (main app module): ', message);
        const temp: Message = message as Message;
        this.openNewMessageSnackBar(temp);
    });

    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((message: Notification) => {
        console.log('Notification from server (home app module): ', message);
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
    if (this._userService.user._id !== message.from._id) {
      let snackBarRef = this.snackBar.open('You have a new message from ' + message.from.firstName +
        ' ' + message.from.lastName, 'Go to message...', { duration: 3500 });
      
      snackBarRef.onAction().subscribe(() => {
        console.log('Going to the message...');
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
