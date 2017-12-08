import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Booking } from 'app/models/booking';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';
import { BookingService } from 'app/services/booking.service';
import { EventSearchResultComponent } from 'app/search/event-search-result/event-search-result.component';


@Component({
  selector: 'app-pick-event',
  templateUrl: './pick-event.component.html',
  styleUrls: ['./pick-event.component.css']
})
export class PickEventComponent implements OnInit {

  user:User;
  artist: User;
  events:Event[];
  deleteStatus:Number;
  artistID:any;

  constructor(private eventService: EventService, private userService: UserService, private bookingService: BookingService,
    private router: Router, private route: ActivatedRoute) { }
  
  ngOnInit() {
    this.user = this.userService.user;
    
    this.eventService.getEventsByUID(this.user._id).then((events: Event[]) => {
      this.events = events;   
    }).then(() => {
      this.artistID = {
        id: this.route.snapshot.params['id']
      }
      return this.artistID["id"];
    }).then((ID: string) => this.userService.getUserByID(ID).then((gottenUser: User) => {
      this.artist = gottenUser;
      })).then(() => this.getAvailableEvents());

  }

  onRequestEvent(event:Event){
    const booking = new Booking(null, 'host-request', event.hostUser, this.artist, event._id, false, false);
    this.bookingService.createBooking(booking).then((booking: Booking) => this.getAvailableEvents());
  }

  public getAvailableEvents() {
    // Get all bookings for the current user
    this.bookingService.getUserBookings(this.userService.user).then((bookings: any[]) => {
      // Loop through the bookings and see if a booking exists for the selected artist
      let tempEventIds: String[] = [];
      for (let result of bookings) {
        if (result.booking.performerUser._id == this.artist._id) {
          tempEventIds.push(result.booking.eventEID);
        }
      }
      // If so, remove those event ids from event list
      let tempEvents: Event[] = [];
      for (let event of this.events) {
        let found = false
        for (let tempEvent of tempEvents) {
          if (tempEvent._id == event._id) {
            found = true;
            continue;
          }
        }
        if (found == false) {
          tempEvents.push(event)
        }
      }
      this.events = tempEvents;
    })

  }

}
