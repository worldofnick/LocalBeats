import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { User } from 'app/models/user';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';
import { FormControl} from "@angular/forms";
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  model:Event;
  user:User;
  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  public place: google.maps.places.PlaceResult;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(private eventService: EventService, private userSerivce: UserService, private router: Router, private ngZone: NgZone, private mapsAPILoader: MapsAPILoader) { }
  
  ngOnInit() {
    this.user = this.userSerivce.user;
    this.model = new Event;

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
          this.place = autocomplete.getPlace();
  
          //verify result
          if (this.place.geometry === undefined || this.place.geometry === null) {
            return;
          }
          
          //set latitude, longitude and zoom
          this.latitude = this.place.geometry.location.lat();
          this.longitude = this.place.geometry.location.lng();
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

 onCreateEvent(form: NgForm) {

  if (this.longitude != null) {
    this.model.location = [this.longitude, this.latitude]
  }

    const eventName = form.value.eventName;
    const eventType = form.value.eventType;
    const eventGenre = form.value.eventGenre;
    const address = form.value.address;
    const fromDate = form.value.fromDate;
    const toDate = form.value.toDate;
    const description = form.value.description;
    const fixedPrice = form.value.fixedPrice;
    const city = this.place.address_components[0].long_name
    const zip = form.value.zip;
    const state = this.place.address_components[2].short_name
    // const hourlyRate: string
    // const deposit: string
    // const isBooked: string
    this.model.zip = zip;
    this.model.state = state;
    this.model.city = city;
    this.model.eventName = eventName;
    this.model.eventType = eventType;
    this.model.eventGenre = eventGenre;
    this.model.address = address;
    // this.model.fromDate = fromDate;
    // this.model.toDate = toDate;
    this.model.description = description;

    console.log("printing event dscription");
    console.log(this.model.description);
    this.model.fixedPrice = fixedPrice;

    this.model.hostUser = this.user;
    this.model.hostEmail = this.user.email;


    console.log("creating event: \n" );
    console.log(this.model);

    this.eventService.createEvent(this.model).then((event: Event) => {
      this.model = event;      
      this.eventService.event = this.model;
      this.router.navigate(['/event-page', this.model._id]); //this will go to the page about the event
    });


    
  }
}
