import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { SearchTerms, Location } from 'app/models/search';
import { SearchService } from 'app/services/search.service';
import { FormControl} from "@angular/forms";
import { MapsAPILoader } from '@agm/core';
import {} from '@types/googlemaps';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  musicGenres = this.searchService.musicGenres;
  eventTypes = this.searchService.eventTypes;
  searchTypes = this.searchService.searchTypes;
  genres = this.searchService.musicGenres;

  model = this.searchService.currentSearch;

  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  
  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(private router: Router, private searchService: SearchService, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) { }
  
  ngOnInit() {
    if (this.model.searchType == 'Musician') {
      this.genres = this.searchService.musicGenres;
    } else {
      this.genres = this.searchService.eventTypes;
    }
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
      this.model.location = {
        longitude: this.longitude,
        latitude: this.latitude
      }
    }
    this.searchService.currentSearch = this.model
    if (this.model.searchType === 'Musician') {

    } else {
      this.searchService.eventSearch(this.model).then((event: [Event]) => {
        this.router.navigate(['/search-result'])
      });
    }
  }

  onChange() {
    if (this.genres == this.musicGenres) {
      this.genres = this.eventTypes
    } else {
      this.genres = this.musicGenres
    }
  }
}
