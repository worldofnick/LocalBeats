import { Component, OnInit, EventEmitter, Input, Output, ElementRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import * as domHelper from '../../../helpers/dom.helper';
import { ThemeService } from '../../../services/theme/theme.service';
import { UserService } from '../../../services/auth/user.service';
import { SearchService } from '../../../services/search/search.service';
import { SearchTerms, Location } from '../../../models/search';

@Component({
  selector: 'topbar',
  templateUrl: './topbar.template.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  isSearchOpen: boolean = false;
  clickedSearch: boolean = false;

  @Input() sidenav;
  @Input() notificPanel;
  @Output() onSearchTypeChange = new EventEmitter<any>();
  selectedValues: string[];
  musicGenres: string[] = ['Rock', 'Country', 'Jazz', 'Blues', 'Hip Hop'];
  eventTypes: string[] = ['Wedding', 'Birthday', 'Business'];
  searchTypes: string[] = ['Musician', 'Event'];
  searchType: string = this.searchTypes[0];
  genres: string[] = this.musicGenres;
  currentSearch: SearchTerms = new SearchTerms(this.searchType, '', null, this.musicGenres[0]);
  public results: any = null;


  @ViewChild("searchplaces") searchElementRef: ElementRef;

  latitude: number;
  longitude: number;
  searchControl: FormControl;
  zoom: number;

  constructor(private userService: UserService, private router: Router, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    domHelper.toggleClass(document.body, 'collapsed-menu');

    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;
    
    //create search FormControl
    this.searchControl = new FormControl();
    
    //set current position
    this.setCurrentPosition();
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
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
          console.log("addy:");
          // place.address_components.
          console.log(place.address_components);
          console.log(place.formatted_address);
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

  onChange() {
    console.log(this.searchType);
    this.results = null;
    if (this.searchType == this.searchTypes[1]) {
      this.genres = this.eventTypes
      this.currentSearch.genre = this.searchType;
    } else {
      this.genres = this.musicGenres
      this.currentSearch.genre = this.musicGenres[0];
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
    if(!domHelper.hasClass(appBody, 'collapsed-menu')) {
      (<HTMLElement>document.querySelector('mat-sidenav-content')).style.marginLeft = '240px'
    }
  }
}