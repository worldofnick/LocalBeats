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
      // this.eventService.events = this.events;   
    });

    this.artistID = {
      id: this.route.snapshot.params['id']
    }

    let ID:String = this.artistID["id"];
    this.userService.getUserByID(ID).then((gottenUser: User) => {
      this.artist = gottenUser;
      console.log("other user")
      console.log(this.user)
      }).then(() => {
        //console.log("other user who i am viewing:");
        //console.log(this.user);
      });

  }

  onRequestEvent(event:Event){
    const booking = new Booking(null, 'host-request', event.hostUser, this.artist, event._id, false, false);
    this.bookingService.createBooking(booking).then((booking: Booking) => {
      console.log("SUCCCCCCESSSSSSS");
    });

  }

  public getBookings(event: Event) {
    this.bookingService.getBooking(this.model).then((bookings: Booking[]) => {
      this.currentBookings = bookings;
      console.log(this.currentBookings)
    })
  }

}
