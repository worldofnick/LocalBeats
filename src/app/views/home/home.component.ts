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
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';

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
  currentSearch: SearchTerms;
  suggestedTitle: String;

  results: any[] = [];
  allResults: any[] = [];

  resultsArtists: any[] = [];
  allResultsArtists: any[] = [];
  searchType: string;

  // Google Places
  latitude: number;
  longitude: number;

  pageIndex: number = 0;
  pageIndex2: number = 0; //for artists
  pageSize = 3; // default page size is 15
  pageSizeOptions = [3];

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private _sharedDataService: SharedDataService,
    private _userService: UserService,
    private _socketService: SocketService,
    private fb: FormBuilder,
    private searchService: SearchService,
  ) { }

  ngOnInit() {
    this.initIoConnection();            // Listen to server for any registered events inside this method
    this.showSnackBarIfNeeded();
    this.userSubscription = this._userService.userResult.subscribe(user => {
      this.user = user;
      this.setupSuggestions();
    });

    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', Validators.required]
    });

    if (this._userService.isAuthenticated()) {
      this.setupSuggestions();
    } else {
      this.setCurrentPosition();
      this.setupDefaultSuggestions();
    }
  }

  setupDefaultSuggestions() {
    this.defaultArtistSearch();
    this.defaultEventSearch();
  }


  defaultArtistSearch() {
    this.currentSearch = new SearchTerms('', '', null, null, null, null, null, null, null);

    this.currentSearch.searchType = 'Rec';
    this.searchType = 'Rec';

    this.currentSearch.location = {
      longitude: -111.891047,
      latitude: 40.760779
    };
    this.currentSearch.genres = ['all genres'];
    this.currentSearch.event_types = ['all events'];
    this.currentSearch.searchType = 'ARec';
    this.searchType = 'Artist';
    if (this._userService.isAuthenticated()) {
      this.currentSearch.uid = this._userService.user._id;
    }
    this.searchService.userSearch(this.currentSearch).then((users: User[]) => {
      this.allResultsArtists = users;
      this.updateResults2();
    });
  }

  defaultEventSearch() {

    this.currentSearch = new SearchTerms('', '', null, null, null, null, null, null, null);

    this.currentSearch.searchType = 'ERec';
    this.searchType = 'Rec';

    this.currentSearch.location = {
      longitude: -111.891047,
      latitude: 40.760779
    };
    this.currentSearch.genres = ['all genres'];
    this.currentSearch.event_types = ['all events'];
    // this.suggestedTitle = 'Events In Salt Lake City';
    if (this._userService.isAuthenticated()) {
      this.currentSearch.uid = this._userService.user._id;
    }

    this.searchService.eventSearch(this.currentSearch).then((events: Event[]) => {
      this.allResults = events;
      this.updateResults();
    });
  }

  // Helper method for Google Places
  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    }
  }

  setupSuggestions() {
    if (this._userService.user !== null && this._userService.user !== undefined) {
      // set suggestions type
      if (this._userService.user.isArtist) {
        // user is an artist
        this.searchType = 'Rec';
        this.suggestedTitle = 'Suggested Events:';
      } else {
        // user is event host.
        this.searchType = 'Artist';
        this.suggestedTitle = 'Suggested Artists:';
      }

      // set current search. then configure it.
      this.currentSearch = new SearchTerms('', '', null, null, null, null, null, null, null);

      // configure genres.
      if (this._userService.user.genres == null || this._userService.user.genres.length == 0) {
        this.currentSearch.genres = ['all genres'];
      } else {
        this.currentSearch.genres = this._userService.user.genres;
      }
      // configure event types
      if (this._userService.user.eventTypes == null || this._userService.user.eventTypes.length == 0) {
        this.currentSearch.event_types = ['all events'];
      } else {
        this.currentSearch.event_types = this._userService.user.eventTypes;
      }
      // configure location
      this.currentSearch.location = {
        longitude: this._userService.user.location[0],
        latitude: this._userService.user.location[1]
      };

      // configure uid
      this.currentSearch.uid = this._userService.user._id;

      // user is an artist so search for event
      this.currentSearch.searchType = 'ARec';
      this.searchService.eventSearch(this.currentSearch).then((events: Event[]) => {
        this.allResults = events;
        if (this.allResults.length == 0) {
          this.defaultEventSearch();
        }
        this.updateResults();
      });

      // its an event host. so search for artists.
      this.currentSearch.searchType = 'ERec';
      this.searchService.userSearch(this.currentSearch).then((users: User[]) => {
        this.allResultsArtists = users;
        if (this.allResultsArtists.length == 0) {
          this.defaultArtistSearch();
        }
        this.updateResults2();
      });
    }
  }

  ngOnDestroy() {
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


  private updateResults2() {
    let startingIndex = (this.pageIndex2 + 1) * this.pageSize - this.pageSize;
    let endIndex = startingIndex + this.pageSize;
    var i: number;

    this.resultsArtists = Array<any>();
    // Slice the results array
    for (i = startingIndex; i < endIndex && i < this.allResultsArtists.length; i++) {
      this.resultsArtists.push(this.allResultsArtists[i]);
    }
  }

  private pageEvent(pageEvent: PageEvent) {
    this.pageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    this.updateResults();
    // Scroll to top of page
    window.scrollTo(0, 0);
  }

  private contactUs() {
    let name = this.contactForm.controls['name'].value;
    let email = this.contactForm.controls['email'].value;
    let subject = this.contactForm.controls['subject'].value;
    let message = this.contactForm.controls['message'].value;
    this._userService.contactUs(name, subject, email, message).subscribe(
      (text: any) => {
        let snackBarRef = this.snackBar.open(text, "", {
          duration: 1500,
        });
      },
      (error) => {
        let snackBarRef = this.snackBar.open(error, "", {
          duration: 1500,
        });
      }
    )
  }

  private pageEvent2(pageEvent: PageEvent) {
    this.pageIndex2 = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    this.updateResults2();
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
      this.router.navigate(['/profile'], { queryParams: { stripe: true } });
    } else if (this.router.url.indexOf('success=false') >= 0) {
      // failure
      let snackBarRef = this.snackBar.open("Failed to Link Account", "", {
        duration: 1500,
      });
      this.router.navigate(['/profile'], { queryParams: { stripe: true } });
    } else if (this.router.url.indexOf('updated=true') >= 0) {
      let snackBarRef = this.snackBar.open("Stripe Details Updated", "", {
        duration: 1500,
      });
      this.router.navigate(['/profile'], { queryParams: { stripe: true } });
    } else if (this.router.url.indexOf('updated=false') >= 0) {
      // failure
      let snackBarRef = this.snackBar.open("Failed to Update Stripe Details", "", {
        duration: 1500,
      });
      this.router.navigate(['/profile'], { queryParams: { stripe: true } });
    }
  }

  /**
   * Listens to the server for any registered events and takes action accordingly.
   */
  initIoConnection() {
    this._socketService.onEvent(SocketEvent.YOU_LOGGED_OUT)
      .subscribe((message: Message) => {
        this.setupDefaultSuggestions();
      });
  }
}
