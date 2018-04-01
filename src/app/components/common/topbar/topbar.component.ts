import { Component, OnInit, EventEmitter, Input, Output, ElementRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef} from '@angular/material';
// import { Socket } from 'ng-socket-io';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import * as domHelper from '../../../helpers/dom.helper';
import { ThemeService } from '../../../services/theme/theme.service';
import { UserService } from '../../../services/auth/user.service';
import { SearchService } from '../../../services/search/search.service';
import * as socketIO from 'socket.io-client';
import { NotificationService } from '../../../services/notification/notification.service';
import { SearchTerms, Location } from '../../../models/search';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { SocketService } from '../../../services/chats/socket.service';
import { SocketEvent } from         '../../../services/chats/model/event';
import { StripeDialogComponent } from '../../../views/events/event-singleton/stripe-dialog.component';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.template.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  @Input() sidenav;
  @Input() notificPanel;
  @Output() onSearchTypeChange = new EventEmitter<any>();
  @ViewChild("searchplaces") searchElementRef: ElementRef;
  genreSelectOpened: boolean = false;
  eventSelectOpened: boolean = false;
  sortSelectOpened: boolean = false;
  startDateOpened: boolean = false;
  startDateClosed: boolean = false;
  endDateOpened: boolean = false;
  endDateClosed: boolean = false;
  searchForm = this.formBuilder.group({
    text: new FormControl('', Validators.required),
    type: new FormControl('Artist', Validators.required),
    genres: new FormControl(),
    events: new FormControl(),
    location: new FormControl(),
    sort: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl()
  });
  // Expansion of search box
  expand: boolean = false;
  // Notifications 
  numNotifications = 0;
  // Google Places
  latitude: number;
  longitude: number;
  zoom: number;
  // Search Values
  searchTypes: string[] = ['artist', 'host', 'event'];
  genresList: string[] = ['rock', 'country', 'jazz', 'blues', 'rap'];
  eventsList: string[] = ['wedding', 'birthday', 'business'];
  currentSearch: SearchTerms = new SearchTerms(this.searchTypes[0], '', null, this.genresList, this.eventsList, null, null, null);
  public results: any = null;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef,
    private _socketService: SocketService,
    public dialog: MatDialog
    ) {
  }

  ngOnInit() {
    // Initialize the menu to be collapsed
    domHelper.toggleClass(document.body, 'collapsed-menu');

    // Socket setup for notifications
    this._socketService.onEvent(SocketEvent.REQUEST_NOTIFICATION_COUNT).subscribe((count: number)=>{
      this.numNotifications = count;
    });

    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
    .subscribe((notification: Notification) => {
      this.numNotifications++;
    });

    // Set Current Location if desired in future
    // this.setCurrentPosition();

    // Load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["(cities)"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.searchForm.setControl('location', new FormControl(place.formatted_address))
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  // Helper method for Google Places
  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  // Logs user out
  logout() {
    this.userService.logout();
    this.numNotifications = 0;
    this.router.navigate(['/']);
  }

  // Triggered by search text box, if the user starts typing, it triggers the dropdown
  onKey(event: any) {
    if(event.keyCode != 13 && !this.expand){
      this.expand = true;
    }
  }
  
  click() {
    if(!this.expand) {
      this.expand = true;
    }
  }

  offClick() {
    if(!this.startDateOpened && !this.genreSelectOpened && !this.eventSelectOpened) {
      if(!this.startDateClosed && !this.endDateClosed) {
        this.expand = false;
      } else {
        this.startDateClosed = false;
        this.endDateClosed = false;
      }
      
    }
  }

  genreSelectOpen() {
    this.genreSelectOpened = !this.genreSelectOpened;
  }

  eventSelectOpen() {
    this.eventSelectOpened = !this.eventSelectOpened;
  }

  sortSelectOpen() {
    this.sortSelectOpened = !this.sortSelectOpened;
  }

  startDateOpen() {
    this.startDateOpened = !this.startDateOpened;
    this.startDateClosed = true;
  }

  endDateOpen() {
    this.endDateOpened = !this.endDateOpened;
    this.endDateClosed = true;
  }

  // Submission of search
  submit() {

    this.currentSearch.from_date = this.searchForm.get('startDate').value;
    this.currentSearch.to_date = this.searchForm.get('endDate').value;
    // Set location for submission
    if (this.longitude != null && this.searchForm.get('location').value != '') {
      this.currentSearch.location = {
        longitude: this.longitude,
        latitude: this.latitude
      };
    } else {
      this.currentSearch.location = null;
    }
    // Set search type
    this.currentSearch.searchType = this.searchForm.get('type').value;
    // Set text
    this.currentSearch.text = this.searchForm.get('text').value;
    // Set genres
    const genres: string[] = this.searchForm.get('genres').value as string[];
    if (genres == null || genres.length == 0) {
      this.currentSearch.genres = ['all genres'];
    } else {
      this.currentSearch.genres = genres;
    }
    // Set events
    const events: string[] = this.searchForm.get('events').value as string[];
    if (events == null || events.length == 0) {
      this.currentSearch.event_types = ['all events'];
    } else {
      this.currentSearch.event_types = events;
    }
    // Set user id if the search is authenticated
    if(this.userService.isAuthenticated()) {
      this.currentSearch.uid = this.userService.user._id;
    } else {
      this.currentSearch.uid = null;
    }

    if (this.currentSearch.searchType === 'Artist' || this.currentSearch.searchType === 'Host') {
      this.searchService.userSearch(this.currentSearch).then((users: User[]) => {
        this.results = users;
        this.searchService.changeResult(this.results, this.currentSearch.searchType);
        this.router.navigate(['/search'])
      });
    } else {
      this.searchService.eventSearch(this.currentSearch).then((events: Event[]) => {
        this.results = events;
        this.searchService.changeResult(this.results, this.currentSearch.searchType);
        this.router.navigate(['/search'])
      });
    }
    this.expand = false;
  }

  // Triggers the notification panel to sideload
  toggleNotific() {
    this.notificPanel.toggle();
  }

  // Triggers the side navigation menu to sideload
  toggleSidenav() {
    this.sidenav.toggle();
  }

  goToMessages(){
    this.router.navigate(['/chat']);
  }

  private authorizeStripe() {
    let dialogRef: MatDialogRef<StripeDialogComponent>;
    dialogRef = this.dialog.open(StripeDialogComponent, {
        width: '250px',
        disableClose: false,
        data: {}
    });
    return dialogRef.afterClosed();
  }

  // Collapses the side navigation menu
  toggleCollapse() {
    let appBody = document.body;
    domHelper.toggleClass(appBody, 'collapsed-menu');
    domHelper.removeClass(document.getElementsByClassName('has-submenu'), 'open');
    // Fix for sidebar
    if (!domHelper.hasClass(appBody, 'collapsed-menu')) {
      (<HTMLElement>document.querySelector('mat-sidenav-content')).style.marginLeft = '240px'
    }
  }
}