import { Component, OnInit, EventEmitter, Input, Output, ElementRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
// import { Socket } from 'ng-socket-io';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import * as domHelper from '../../../helpers/dom.helper';
import { ThemeService } from '../../../services/theme/theme.service';
import { UserService } from '../../../services/auth/user.service';
import { SearchService } from '../../../services/search/search.service';
// import { Socket } from 'socket.io'
import { NotificationService } from '../../../services/notification/notification.service';
import { SearchTerms, Location } from '../../../models/search';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.template.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  searchForm: FormGroup;

  numNotifications:any = 0;
  isSearchOpen: boolean = false;
  clickedSearch: boolean = false;

  @Input() sidenav;
  @Input() notificPanel;
  @Output() onSearchTypeChange = new EventEmitter<any>();
  selectedValues: string[];
  musicGenres: any = [{ genre: 'Rock', checked: false }, { genre: 'Country', checked: false }, { genre: 'Jazz', checked: false }, { genre: 'Blues', checked: false }, { genre: 'Rap', checked: false }];
  eventTypes: any = [{ genre: 'Wedding', checked: false }, { genre: 'Birthday', checked: false }, { genre: 'Business', checked: false }];
  searchTypes: string[] = ['Musician', 'Event'];
  genres: any = this.musicGenres;
  currentSearch: SearchTerms = new SearchTerms(this.searchTypes[0], '', null, this.musicGenres[0]);
  public results: any = null;


  @ViewChild("searchplaces") searchElementRef: ElementRef;

  latitude: number;
  longitude: number;
  //searchControl: FormControl;
  zoom: number;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    domHelper.toggleClass(document.body, 'collapsed-menu');

    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //create search FormControl
    //this.searchControl = new FormControl();

    //set current position
    this.setCurrentPosition();

    this.searchForm = this.formBuilder.group({
      text: new FormControl('', Validators.required),
      type: new FormControl('Musician', Validators.required),
      genres: this.formBuilder.array([]),
      location: new FormControl()
    });

    // this.notificationService.connect();
    this.notificationService.getNotificationsCountForUser(555).then((num) => {
      console.log(num);
      this.numNotifications = num;
      console.log("printing number of notifs");
      console.log(this.numNotifications);
    });
    // this.notificationService.getNotificationsCountForUser(555)

    }

  private setCurrentPosition() {
        if("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            this.zoom = 12;
          });
        }
      }

  logout() {
        this.userService.logout();
        this.router.navigate(['/']);
      }

  clickedInsideSearch() {
        this.clickedSearch = true;
        this.isSearchOpen = true;
        this.changeDetector.detectChanges();

        //load Places Autocomplete
        this.mapsAPILoader.load().then(() => {
          let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
            types: ["(cities)"]
          });
          autocomplete.addListener("place_changed", () => {
            this.ngZone.run(() => {
              //get the place result
              let place: google.maps.places.PlaceResult = autocomplete.getPlace();
              // place.address_components
              // place.formatted_address
              this.searchForm.setControl('location', new FormControl(place.formatted_address))
              //verify result
              if (place.geometry === undefined || place.geometry === null) {
                return;
              }
              //set latitude, longitude and zoom
              this.latitude = place.geometry.location.lat();
              this.longitude = place.geometry.location.lng();
              this.zoom = 12;
            });
          });
        });
      }

  clickedOutsideSearch() {
        if(this.isSearchOpen && !this.clickedSearch) {
          this.isSearchOpen = false;
        } else {
          this.clickedSearch = false;
        }
      }

  submit() {
        // Set location for submission
        if(this.longitude != null) {
          this.currentSearch.location = {
            longitude: this.longitude,
            latitude: this.latitude
          };
        }
    // Set search type
    this.currentSearch.searchType = this.searchForm.get('type').value;
        // Set text
        this.currentSearch.text = this.searchForm.get('text').value;
        console.log(typeof (this.currentSearch.text))
    // Set genre
    const genres = <FormArray>this.searchForm.get('genres') as FormArray;
        if(genres.length == 0 && this.currentSearch.searchType == 'Musician') {
          this.currentSearch.genre = 'All Genres';
        } else {
          this.currentSearch.genre = 'All Events'
        }

    if(this.currentSearch.searchType === 'Musician') {
          this.searchService.userSearch(this.currentSearch).then((users: User[]) => {
            this.results = users;
            this.searchService.changeResult(this.results, this.currentSearch.searchType);
            console.log(this.results);
            this.router.navigate(['/search'])
          });
        } else {
          this.searchService.eventSearch(this.currentSearch).then((events: Event[]) => {
            this.results = events;
            this.searchService.changeResult(this.results, this.currentSearch.searchType);
            console.log(this.results)
            this.router.navigate(['/search'])
          });
        }
      }

  onPickingGenre(event) {
        const genres = <FormArray>this.searchForm.get('genres') as FormArray;

        if(event.checked) {
          event.source.value.checked = true;
          genres.push(new FormControl(event.source.value))
        } else {
          event.source.value.checked = false;
          const i = genres.controls.findIndex(x => x.value === event.source.value);
          genres.removeAt(i);
        }
      }

  onChange() {
        const genres = <FormArray>this.searchForm.get('genres') as FormArray;
        while(genres.length !== 0) {
          genres.removeAt(0)
        }
    for(let i = 0; i< this.genres.length; i++) {
      this.genres[i].checked = false;
    }
    this.results = null;
    if (this.searchForm.controls['type'].value == this.searchTypes[1]) {
      this.genres = this.eventTypes
    } else {
      this.genres = this.musicGenres
    }
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
    if (!domHelper.hasClass(appBody, 'collapsed-menu')) {
      (<HTMLElement>document.querySelector('mat-sidenav-content')).style.marginLeft = '240px'
    }
  }
}