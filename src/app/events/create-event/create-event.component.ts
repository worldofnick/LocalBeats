import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { User } from 'app/models/user';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';
import { FormControl } from "@angular/forms";
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  model: Event;
  user: User;
  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  public place: google.maps.places.PlaceResult;
  public currentPlace: google.maps.places.PlaceResult;
  // public addressObject
  public updating: boolean;
  public submitButtonText:string;
  EID: any;
  public selectedDate:Date;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(private eventService: EventService, private userSerivce: UserService, private router: Router,
    private ngZone: NgZone, private mapsAPILoader: MapsAPILoader, private route: ActivatedRoute) { }

  ngOnInit() {
    //parse url
    this.EID = {
      id: this.route.snapshot.params['id']
    }

    let ID = this.EID["id"];
    if (ID == null) {
      // console.log("creating event");
      this.updating = false;
      this.submitButtonText = "Create Event";
    } else {
      console.log("updating event w/ id");
      // console.log(ID);
      this.updating = true;
      this.submitButtonText = "Update Event";
    }

    // this.currentPlace.


    if (this.updating) {
      this.eventService.getEventByEID(this.EID).then((event: Event) => {
        this.model = event;
        // console.log(this.model);
        // this.user = event.hostUser;
      });
    }

    this.user = this.userSerivce.user;
    this.model = new Event;
    this.model.eventType="Choose Event Type Here";
    this.model.eventGenre="choose genre here";
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


    // this.selectedDate.
    this.model.toDate
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

    // const hourlyRate: string
    // const deposit: string
    // const isBooked: string
    // this.model.zip = zip;
  
    try {
      const city = this.place.address_components[0].long_name
      const state = this.place.address_components[2].short_name
      this.model.state = state;
      this.model.city = city;
    }
    catch (e) {
      console.log("location not filled out");
    }
    this.model.eventName = eventName;
    this.model.eventType = eventType;
    this.model.eventGenre = eventGenre;
    this.model.address = address;
    this.model.fromDate = this.selectedDate;
    // this.model.toDate = toDate;
    this.model.description = description;
    this.model.fixedPrice = fixedPrice;

    this.model.hostUser = this.user;
    this.model.hostEmail = this.user.email;

    if (!this.updating) {
      this.eventService.createEvent(this.model).then((event: Event) => {
        this.model = event;
        this.eventService.event = this.model;
        this.router.navigate(['/event-page', this.model._id]); //this will go to the page about the event
      });
    } else {
      this.eventService.updateEvent(this.model).then((event: Event) => {
        this.model = event;
        this.eventService.event = this.model;
        this.router.navigate(['/my-events']); //this will go back to my events.
      });
    }



  }
}
