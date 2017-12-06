import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { SearchTerms, Location } from 'app/models/search';
import { SearchService } from 'app/services/search.service';
import { FormControl} from "@angular/forms";
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { getType } from '@angular/core/src/errors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public musicGenres: any = ['Rock', 'Country', 'Jazz', 'Blues', 'Hip Hop'];
  public eventTypes: any = ['Wedding', 'Birthday', 'Business'];
  public searchTypes: any = ['Musician', 'Event'];
  public genres = this.musicGenres;
  public currentSearch: SearchTerms = new SearchTerms(this.searchTypes[0], '', null, this.musicGenres[0]);
  public results: any = null;
  public initialSearch = false;

  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  
  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(private router: Router, private searchService: SearchService, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) { }
  
  ngOnInit() {

    this.searchService.eventTypes().then((types: string[]) => {
      this.eventTypes = types;
    }).then(() => this.searchService.genres().then((types: string[]) => {
      this.musicGenres = types;
      this.genres = this.musicGenres;
      this.currentSearch = new SearchTerms(this.searchTypes[0], '', null, this.musicGenres[0]);
    }));
    
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;
    
    //create search FormControl
    this.searchControl = new FormControl();
    
    //set current position
    this.setCurrentPosition();
    
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["(cities)"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
  
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

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  onSubmit() { 
    if (this.longitude != null) {
      this.currentSearch.location = {
        longitude: this.longitude,
        latitude: this.latitude
      }
    }
    if (this.currentSearch.searchType === 'Musician') {
      this.searchService.userSearch(this.currentSearch).then((users: User[]) => {
        this.results = users;
        console.log(this.results)
        this.initialSearch = true;
      });
    } else {
      this.searchService.eventSearch(this.currentSearch).then((events: Event[]) => {
        this.results = events;
        console.log(this.results)
        this.initialSearch = true;
      });
    }
  }

  onChange() {
    if (this.genres == this.musicGenres) {
      this.genres = this.eventTypes
      this.currentSearch.genre = this.eventTypes[0];
    } else {
      this.genres = this.musicGenres
      this.currentSearch.genre = this.musicGenres[0];
    }
  }

}
